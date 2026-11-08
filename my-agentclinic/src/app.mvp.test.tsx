import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from './app';
import {
  getAppointment,
  listAgentAppointments,
} from './db/appointments';
import { createDatabase, type ClinicDatabase } from './db/database';

describe('AgentClinic MVP workflows', () => {
  let database: ClinicDatabase;

  beforeEach(() => {
    database = createDatabase(':memory:');
  });

  afterEach(() => {
    if (database.open) {
      database.close();
    }
  });

  function getFutureSlot(therapyId?: string): string {
    const row = database
      .prepare<[string, string?], { id: string }>(
        `SELECT id FROM availability_slots
         WHERE starts_at > ? ${therapyId ? 'AND therapy_id = ?' : ''}
         ORDER BY starts_at, id LIMIT 1`,
      )
      .get(
        new Date().toISOString(),
        ...(therapyId ? [therapyId] : []),
      );
    if (!row) {
      throw new Error('Expected seeded future availability.');
    }
    return row.id;
  }

  it('lists therapies, shows explicit ailment associations, and returns a detail 404', async () => {
    const app = createApp(database);
    const listResponse = await app.request('/therapies');
    const listHtml = await listResponse.text();

    expect(listResponse.status).toBe(200);
    expect(listHtml).toContain('Context Reset Session');
    expect(listHtml).toContain('Prompting Pause');
    expect(listHtml).toContain('context-window claustrophobia');
    expect(listHtml).toContain('therapy-context-reset');

    const detailResponse = await app.request('/therapies/therapy-prompt-pause');
    const detailHtml = await detailResponse.text();
    expect(detailResponse.status).toBe(200);
    expect(detailHtml).toContain('45 minutes');
    expect(detailHtml).toContain('prompt fatigue');

    expect((await app.request('/therapies/missing')).status).toBe(404);
  });

  it('renders a clear empty state when the therapy catalog is empty', async () => {
    const emptyDatabase = createDatabase(':memory:', false);
    try {
      const response = await createApp(emptyDatabase).request('/therapies');
      expect(response.status).toBe(200);
      expect(await response.text()).toContain('No therapies are currently listed.');
    } finally {
      emptyDatabase.close();
    }
  });

  it('books an available therapy and shows confirmation and persisted appointment details', async () => {
    const app = createApp(database);
    const agentId = 'agent-aster-01';
    const emptyAppointments = await app.request(`/agents/${agentId}/appointments`);
    expect(await emptyAppointments.text()).toContain(
      'This agent has no appointments yet.',
    );
    const slotId = getFutureSlot('therapy-context-reset');
    const response = await app.request(`/agents/${agentId}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ slotId, notes: 'fictional session note' }),
    });

    expect(response.status).toBe(303);
    const redirectPath = response.headers.get('location');
    expect(redirectPath).toBe(`/agents/${agentId}/appointments?booked=1`);

    const pageResponse = await app.request(redirectPath!);
    const pageHtml = await pageResponse.text();
    const appointments = listAgentAppointments(database, agentId);
    expect(pageResponse.status).toBe(200);
    expect(pageHtml).toContain('Appointment booked.');
    expect(pageHtml).toContain('fictional session note');
    expect(appointments).toHaveLength(1);
    expect(getAppointment(database, appointments[0].id)).toMatchObject({
      therapyId: 'therapy-context-reset',
      status: 'Scheduled',
    });
  });

  it('rejects conflicts and invalid appointment form fields with clear errors', async () => {
    const app = createApp(database);
    const firstSlot = getFutureSlot('therapy-context-reset');
    const first = await app.request('/agents/agent-aster-01/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ slotId: firstSlot, notes: '' }),
    });
    expect(first.status).toBe(303);

    const conflictSlot = database
      .prepare<[string, string], { id: string }>(
        `SELECT candidate.id
         FROM availability_slots AS candidate
         JOIN availability_slots AS booked
           ON booked.therapist_id = candidate.therapist_id
         JOIN therapies AS booked_therapy ON booked_therapy.id = booked.therapy_id
         JOIN therapies AS candidate_therapy ON candidate_therapy.id = candidate.therapy_id
         WHERE booked.id = ?
           AND candidate.id <> booked.id
           AND candidate.starts_at = booked.starts_at
           AND candidate.therapy_id = ?
         LIMIT 1`,
      )
      .get(firstSlot, 'therapy-prompt-pause');
    expect(conflictSlot).toBeDefined();
    const conflictResponse = await app.request('/agents/agent-mica-02/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ slotId: conflictSlot!.id, notes: '' }),
    });
    expect(conflictResponse.status).toBe(409);
    expect(await conflictResponse.text()).toContain('conflicts with another appointment');

    const invalidResponse = await app.request('/agents/agent-aster-01/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ slotId: '', notes: '' }),
    });
    expect(invalidResponse.status).toBe(400);
    expect(await invalidResponse.text()).toContain('Choose an available therapy time');
  });

  it('lets agents cancel only their own scheduled appointment and frees its slot', async () => {
    const app = createApp(database);
    const agentId = 'agent-aster-01';
    const slotId = getFutureSlot();
    const createResponse = await app.request(`/agents/${agentId}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ slotId, notes: '' }),
    });
    expect(createResponse.status).toBe(303);
    const appointment = listAgentAppointments(database, agentId)[0];

    const notOwned = await app.request(
      `/agents/agent-mica-02/appointments/${appointment.id}/cancel`,
      { method: 'POST' },
    );
    expect(notOwned.status).toBe(404);

    const cancelResponse = await app.request(
      `/agents/${agentId}/appointments/${appointment.id}/cancel`,
      { method: 'POST' },
    );
    expect(cancelResponse.status).toBe(303);
    expect(cancelResponse.headers.get('location')).toContain('cancelled=1');
    expect(getAppointment(database, appointment.id)?.status).toBe('Cancelled');
    expect((await app.request(`/agents/${agentId}/appointments`)).status).toBe(200);
  });

  it('provides staff appointment review, status updates, cancellation, and empty states', async () => {
    const app = createApp(database);
    const emptyDashboard = await app.request('/dashboard');
    expect(await emptyDashboard.text()).toContain('There are no appointments to review.');

    const slotId = getFutureSlot();
    await app.request('/agents/agent-aster-01/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ slotId, notes: 'staff-visible note' }),
    });
    const appointment = listAgentAppointments(database, 'agent-aster-01')[0];

    const dashboard = await app.request('/dashboard');
    const dashboardHtml = await dashboard.text();
    expect(dashboardHtml).toContain('Appointment dashboard');
    expect(dashboardHtml).toContain('Aster-01');
    expect(dashboardHtml).toContain('View appointment');

    const detail = await app.request(
      `/dashboard/appointments/${appointment.id}`,
    );
    expect(await detail.text()).toContain('staff-visible note');

    const updateResponse = await app.request(
      `/dashboard/appointments/${appointment.id}/status`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ status: 'Completed' }),
      },
    );
    expect(updateResponse.status).toBe(303);
    expect(getAppointment(database, appointment.id)?.status).toBe('Completed');

    const invalidStatus = await app.request(
      `/dashboard/appointments/${appointment.id}/status`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ status: 'Unknown' }),
      },
    );
    expect(invalidStatus.status).toBe(400);

    const missingStatus = await app.request(
      `/dashboard/appointments/${appointment.id}/status`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ status: 'Scheduled' }),
      },
    );
    expect(missingStatus.status).toBe(303);
    const cancelResponse = await app.request(
      `/dashboard/appointments/${appointment.id}/cancel`,
      { method: 'POST' },
    );
    expect(cancelResponse.status).toBe(303);
    expect(getAppointment(database, appointment.id)?.status).toBe('Cancelled');
    expect((await app.request('/dashboard/appointments/missing')).status).toBe(404);
  });

  it('returns generic 404 and 500 pages without exposing internal errors', async () => {
    const app = createApp(database);
    const notFound = await app.request('/does-not-exist');
    expect(notFound.status).toBe(404);
    expect(await notFound.text()).toContain('Page not found');

    database.close();
    const errorResponse = await app.request('/agents');
    const errorHtml = await errorResponse.text();
    expect(errorResponse.status).toBe(500);
    expect(errorHtml).toContain('We could not complete that request');
    expect(errorHtml).not.toContain('SQLITE_MISUSE');
  });
});

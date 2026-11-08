import { afterEach, describe, expect, it } from 'vitest';
import { createDatabase, type ClinicDatabase } from './database';
import {
  cancelAgentAppointment,
  cancelScheduledAppointment,
  createAppointment,
  getAppointment,
  listAgentAppointments,
  listAvailableSlots,
  updateAppointmentStatus,
} from './appointments';

const databases: ClinicDatabase[] = [];

function makeDatabase(): ClinicDatabase {
  const database = createDatabase(':memory:');
  databases.push(database);
  return database;
}

function futureTime(dayOffset: number, hour: number, minute = 0): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + dayOffset);
  date.setUTCHours(hour, minute, 0, 0);
  return date.toISOString();
}

function addSlot(
  database: ClinicDatabase,
  id: string,
  therapistId: string,
  therapyId: string,
  startsAt: string,
): void {
  database
    .prepare(
      `INSERT INTO availability_slots (id, therapist_id, therapy_id, starts_at)
       VALUES (?, ?, ?, ?)`,
    )
    .run(id, therapistId, therapyId, startsAt);
}

afterEach(() => {
  for (const database of databases.splice(0)) {
    if (database.open) {
      database.close();
    }
  }
});

describe('appointment persistence and availability', () => {
  it('creates appointments, persists details, and releases availability on agent cancellation', () => {
    const database = makeDatabase();
    const slotId = 'test-slot-cancel';
    addSlot(
      database,
      slotId,
      'therapist-fern-01',
      'therapy-context-reset',
      futureTime(10, 8),
    );

    const result = createAppointment(database, {
      agentId: 'agent-aster-01',
      slotId,
      notes: '  fictional note  ',
    });

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }
    expect(listAgentAppointments(database, 'agent-aster-01')).toHaveLength(1);
    expect(getAppointment(database, result.appointmentId)).toMatchObject({
      agentId: 'agent-aster-01',
      slotId,
      therapyId: 'therapy-context-reset',
      therapistId: 'therapist-fern-01',
      notes: 'fictional note',
      status: 'Scheduled',
    });
    expect(listAvailableSlots(database, 'agent-mica-02').some(({ id }) => id === slotId)).toBe(
      false,
    );

    expect(
      cancelAgentAppointment(database, 'agent-aster-01', result.appointmentId),
    ).toBe(true);
    expect(getAppointment(database, result.appointmentId)?.status).toBe('Cancelled');
    expect(listAvailableSlots(database, 'agent-mica-02').some(({ id }) => id === slotId)).toBe(
      true,
    );
    expect(
      cancelAgentAppointment(database, 'agent-aster-01', result.appointmentId),
    ).toBe(false);
  });

  it('rejects overlapping appointments for the same therapist or same agent', () => {
    const database = makeDatabase();
    addSlot(
      database,
      'therapist-conflict-first',
      'therapist-fern-01',
      'therapy-context-reset',
      futureTime(10, 8),
    );
    addSlot(
      database,
      'therapist-conflict-overlap',
      'therapist-fern-01',
      'therapy-prompt-pause',
      futureTime(10, 8, 20),
    );
    addSlot(
      database,
      'agent-conflict-overlap',
      'therapist-sage-02',
      'therapy-prompt-pause',
      futureTime(10, 8, 15),
    );

    const first = createAppointment(database, {
      agentId: 'agent-aster-01',
      slotId: 'therapist-conflict-first',
      notes: '',
    });
    expect(first.success).toBe(true);

    const sameTherapist = createAppointment(database, {
      agentId: 'agent-mica-02',
      slotId: 'therapist-conflict-overlap',
      notes: '',
    });
    expect(sameTherapist).toMatchObject({
      success: false,
      error: expect.stringContaining('conflicts'),
    });

    const sameAgent = createAppointment(database, {
      agentId: 'agent-aster-01',
      slotId: 'agent-conflict-overlap',
      notes: '',
    });
    expect(sameAgent).toMatchObject({
      success: false,
      error: expect.stringContaining('conflicts'),
    });
  });

  it('allows different therapists at the same time and permits back-to-back appointments', () => {
    const database = makeDatabase();
    const startsAt = futureTime(10, 8);
    addSlot(
      database,
      'parallel-fern',
      'therapist-fern-01',
      'therapy-context-reset',
      startsAt,
    );
    addSlot(
      database,
      'parallel-sage',
      'therapist-sage-02',
      'therapy-context-reset',
      startsAt,
    );
    addSlot(
      database,
      'boundary-back-to-back',
      'therapist-fern-01',
      'therapy-prompt-pause',
      futureTime(10, 8, 30),
    );

    expect(
      createAppointment(database, {
        agentId: 'agent-aster-01',
        slotId: 'parallel-fern',
        notes: '',
      }).success,
    ).toBe(true);
    expect(
      createAppointment(database, {
        agentId: 'agent-mica-02',
        slotId: 'parallel-sage',
        notes: '',
      }).success,
    ).toBe(true);
    expect(
      createAppointment(database, {
        agentId: 'agent-aster-01',
        slotId: 'boundary-back-to-back',
        notes: '',
      }).success,
    ).toBe(true);
  });

  it('checks the full therapy duration and rejects invalid or past booking data', () => {
    const database = makeDatabase();
    addSlot(
      database,
      'duration-long-session',
      'therapist-sage-02',
      'therapy-prompt-pause',
      futureTime(10, 9),
    );
    addSlot(
      database,
      'duration-overlap',
      'therapist-sage-02',
      'therapy-context-reset',
      futureTime(10, 9, 44),
    );
    addSlot(
      database,
      'duration-boundary',
      'therapist-sage-02',
      'therapy-context-reset',
      futureTime(10, 9, 45),
    );
    addSlot(
      database,
      'past-slot',
      'therapist-sage-02',
      'therapy-context-reset',
      new Date(Date.now() - 60_000).toISOString(),
    );

    expect(
      createAppointment(database, {
        agentId: 'agent-aster-01',
        slotId: 'duration-long-session',
        notes: '',
      }).success,
    ).toBe(true);
    expect(
      createAppointment(database, {
        agentId: 'agent-mica-02',
        slotId: 'duration-overlap',
        notes: '',
      }).success,
    ).toBe(false);
    expect(
      createAppointment(database, {
        agentId: 'agent-mica-02',
        slotId: 'duration-boundary',
        notes: '',
      }).success,
    ).toBe(true);
    expect(
      createAppointment(database, {
        agentId: 'agent-mica-02',
        slotId: 'past-slot',
        notes: '',
      }),
    ).toMatchObject({ success: false, error: expect.stringContaining('future') });
    expect(
      createAppointment(database, {
        agentId: 'missing-agent',
        slotId: 'duration-boundary',
        notes: '',
      }),
    ).toMatchObject({ success: false, error: expect.stringContaining('agent') });
    expect(
      createAppointment(database, {
        agentId: 'agent-mica-02',
        slotId: '',
        notes: '',
      }),
    ).toMatchObject({ success: false, error: expect.stringContaining('Choose') });
    expect(
      createAppointment(database, {
        agentId: 'agent-mica-02',
        slotId: 'duration-boundary',
        notes: 'n'.repeat(1001),
      }),
    ).toMatchObject({ success: false, error: expect.stringContaining('1,000') });
  });

  it('prevents staff from rescheduling into a conflict and supports status transitions', () => {
    const database = makeDatabase();
    addSlot(
      database,
      'staff-slot-first',
      'therapist-fern-01',
      'therapy-context-reset',
      futureTime(10, 8),
    );
    addSlot(
      database,
      'staff-slot-second',
      'therapist-fern-01',
      'therapy-prompt-pause',
      futureTime(10, 8, 15),
    );
    const first = createAppointment(database, {
      agentId: 'agent-aster-01',
      slotId: 'staff-slot-first',
      notes: '',
    });
    expect(first.success).toBe(true);
    if (!first.success) {
      return;
    }

    expect(cancelScheduledAppointment(database, first.appointmentId)).toBe(true);
    expect(getAppointment(database, first.appointmentId)?.status).toBe('Cancelled');
    const second = createAppointment(database, {
      agentId: 'agent-mica-02',
      slotId: 'staff-slot-second',
      notes: '',
    });
    expect(second.success).toBe(true);
    expect(
      updateAppointmentStatus(database, first.appointmentId, 'Scheduled'),
    ).toMatchObject({
      success: false,
      error: expect.stringContaining('conflicts'),
    });
    expect(
      updateAppointmentStatus(database, first.appointmentId, 'Completed').success,
    ).toBe(true);
    expect(getAppointment(database, first.appointmentId)?.status).toBe('Completed');
    expect(
      updateAppointmentStatus(database, 'missing-appointment', 'Scheduled'),
    ).toMatchObject({ success: false });
  });
});

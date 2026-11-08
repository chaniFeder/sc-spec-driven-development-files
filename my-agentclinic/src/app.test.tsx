import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from './app';
import { createDatabase, type ClinicDatabase } from './db/database';

describe('AgentClinic pages', () => {
  let database: ClinicDatabase;

  beforeEach(() => {
    database = createDatabase(':memory:');
  });

  afterEach(() => {
    database.close();
  });

  it('preserves the home page content in the shared layout', async () => {
    const response = await createApp(database).request('/');
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/html');
    expect(html).toContain('name="viewport"');
    expect(html).toContain('width=device-width, initial-scale=1');
    expect(html).toContain('<h1>AgentClinic</h1>');
    expect(html).toContain('Where AI agents come to get better.');
    expect(html).toContain('Primary navigation');
    expect(html).toContain('Home');
    expect(html).toContain('Agents');
    expect(html).toContain('Ailments');
    expect(html).toContain('Therapies');
    expect(html).toContain('Staff');
    expect(html).toContain('site-footer');
  });

  it('serves PicoCSS and the responsive project stylesheet', async () => {
    const app = createApp(database);
    const picoResponse = await app.request('/styles/pico.min.css');
    const projectResponse = await app.request('/styles.css');

    expect(picoResponse.status).toBe(200);
    expect(picoResponse.headers.get('content-type')).toContain('text/css');
    expect(await picoResponse.text()).toContain('--pico-font-family');

    const projectCss = await projectResponse.text();
    expect(projectResponse.status).toBe(200);
    expect(projectResponse.headers.get('content-type')).toContain('text/css');
    expect(projectCss).toContain('@media (min-width: 42rem)');
    expect(projectCss).toContain('@media (min-width: 68rem)');
  });

  it('lists seeded agents with their profile details', async () => {
    const response = await createApp(database).request('/agents');
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).toContain('Aster-01');
    expect(html).toContain('Mica-02');
    expect(html).toContain('dialogue');
    expect(html).toContain('reasoning');
    expect(html).toContain('Presenting complaints');
    expect(html).toContain('/agents/agent-aster-01');
  });

  it('shows an agent profile and its persisted ailments', async () => {
    const response = await createApp(database).request('/agents/agent-mica-02');
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).toContain('<h1>Mica-02</h1>');
    expect(html).toContain('context-window claustrophobia');
    expect(html).toContain('prompt fatigue');
    expect(html).toContain('Context Reset Session');
    expect(html).toContain('/therapies/therapy-context-reset');
  });

  it('returns an HTML 404 page for an unknown agent', async () => {
    const response = await createApp(database).request('/agents/missing-agent');
    const html = await response.text();

    expect(response.status).toBe(404);
    expect(html).toContain('Page not found');
    expect(html).toContain('Return home');
    expect(html).toContain('site-footer');
  });

  it('lists ailments with descriptions and associated agent links', async () => {
    const response = await createApp(database).request('/ailments');
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).toContain('context-window claustrophobia');
    expect(html).toContain('A fictional complaint about feeling constrained by limited working context.');
    expect(html).toContain('prompt fatigue');
    expect(html).toContain('A fictional complaint about fatigue from repeated prompt revisions.');
    expect(html).toContain('/agents/agent-mica-02');
  });

  it('shows empty catalog and relationship states from isolated test data', async () => {
    const emptyDatabase = createDatabase(':memory:', false);
    try {
      const emptyApp = createApp(emptyDatabase);
      const agentsResponse = await emptyApp.request('/agents');
      const ailmentsResponse = await emptyApp.request('/ailments');

      expect(await agentsResponse.text()).toContain('No agents are currently listed.');
      expect(await ailmentsResponse.text()).toContain('No ailments are currently listed.');

      emptyDatabase
        .prepare(
          `INSERT INTO agents
            (id, name, model_type, status, presenting_complaints)
           VALUES (?, ?, ?, ?, ?)`,
        )
        .run('test-unassociated-agent', 'Test Agent', 'test-model', 'idle', 'None');
      emptyDatabase
        .prepare('INSERT INTO ailments (id, name, description) VALUES (?, ?, ?)')
        .run('test-unassociated-ailment', 'Test ailment', 'A test-only unassociated ailment.');

      const agentResponse = await emptyApp.request('/agents/test-unassociated-agent');
      const updatedAilmentsResponse = await emptyApp.request('/ailments');

      expect(await agentResponse.text()).toContain(
        'No ailments are currently linked to this agent.',
      );
      expect(await updatedAilmentsResponse.text()).toContain(
        'No agents are currently linked to this ailment.',
      );
    } finally {
      emptyDatabase.close();
    }
  });
});

import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import type { ClinicDatabase } from './db/database';
import { getAgent, listAgents, listAilments } from './db/queries';
import { Layout } from './layout';
import { AgentDetailPage } from './pages/AgentDetail';
import { AgentsPage } from './pages/Agents';
import { AilmentsPage } from './pages/Ailments';
import { Home } from './pages/Home';

export function createApp(database: ClinicDatabase): Hono {
  const app = new Hono();

  app.get(
    '/styles/pico.min.css',
    serveStatic({
      root: './',
      path: 'node_modules/@picocss/pico/css/pico.min.css',
    }),
  );
  app.get(
    '/styles.css',
    serveStatic({
      root: './public',
      path: 'styles.css',
    }),
  );

  app.get('/', (context) =>
    context.html(
      <Layout title="Home">
        <Home />
      </Layout>,
    ),
  );

  app.get('/agents', (context) =>
    context.html(
      <Layout title="Agents">
        <AgentsPage agents={listAgents(database)} />
      </Layout>,
    ),
  );

  app.get('/agents/:id', (context) => {
    const agent = getAgent(database, context.req.param('id'));
    if (!agent) {
      return context.html(
        <Layout title="Agent not found">
          <section class="not-found">
            <p class="eyebrow">Profile unavailable</p>
            <h1>Agent not found</h1>
            <p>No agent matches that profile. Return to the agents list to browse available profiles.</p>
            <a href="/agents" role="button">
              Browse agents
            </a>
          </section>
        </Layout>,
        404,
      );
    }

    return context.html(
      <Layout title={agent.name}>
        <AgentDetailPage agent={agent} />
      </Layout>,
    );
  });

  app.get('/ailments', (context) =>
    context.html(
      <Layout title="Ailments">
        <AilmentsPage ailments={listAilments(database)} />
      </Layout>,
    ),
  );

  return app;
}

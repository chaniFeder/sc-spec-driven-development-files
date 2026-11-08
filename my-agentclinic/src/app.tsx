import { serveStatic } from '@hono/node-server/serve-static';
import { Hono, type Context } from 'hono';
import type { ClinicDatabase } from './db/database';
import {
  cancelAgentAppointment,
  cancelScheduledAppointment,
  createAppointment,
  getAppointment,
  listAgentAppointments,
  listAppointments,
  listAvailableSlots,
  updateAppointmentStatus,
  type AppointmentStatus,
} from './db/appointments';
import {
  getAgent,
  getTherapy,
  listAgents,
  listAilments,
  listTherapies,
} from './db/queries';
import { Layout } from './layout';
import { AgentAppointmentsPage } from './pages/AgentAppointments';
import { AgentDetailPage } from './pages/AgentDetail';
import { AgentsPage } from './pages/Agents';
import { AilmentsPage } from './pages/Ailments';
import { Home } from './pages/Home';
import { StaffAppointmentPage, StaffDashboard } from './pages/StaffDashboard';
import { TherapiesPage, TherapyDetailPage } from './pages/Therapies';

function NotFoundPage() {
  return (
    <Layout title="Page not found">
      <section class="not-found">
        <p class="eyebrow">Page unavailable</p>
        <h1>Page not found</h1>
        <p>The page or record you requested could not be found.</p>
        <a href="/" role="button">
          Return home
        </a>
      </section>
    </Layout>
  );
}

function renderAgentAppointments(
  context: Context,
  database: ClinicDatabase,
  agentId: string,
  options: {
    notice?: 'booked' | 'cancelled';
    error?: string;
    status?: 200 | 400 | 409;
  } = {},
) {
  const agent = getAgent(database, agentId);
  if (!agent) {
    return context.html(NotFoundPage(), 404);
  }

  return context.html(
    <Layout title={`${agent.name}'s appointments`}>
      <AgentAppointmentsPage
        agent={agent}
        appointments={listAgentAppointments(database, agentId)}
        slots={listAvailableSlots(database, agentId)}
        notice={options.notice}
        error={options.error}
      />
    </Layout>,
    options.status,
  );
}

function renderStaffAppointment(
  context: Context,
  database: ClinicDatabase,
  appointmentId: string,
  options: {
    notice?: 'updated' | 'cancelled';
    error?: string;
    status?: 200 | 400 | 409;
  } = {},
) {
  const appointment = getAppointment(database, appointmentId);
  if (!appointment) {
    return context.html(NotFoundPage(), 404);
  }

  return context.html(
    <Layout title="Appointment details">
      <StaffAppointmentPage
        appointment={appointment}
        notice={options.notice}
        error={options.error}
      />
    </Layout>,
    options.status,
  );
}

function isAppointmentStatus(value: string): value is AppointmentStatus {
  return value === 'Scheduled' || value === 'Cancelled' || value === 'Completed';
}

export function createApp(database: ClinicDatabase): Hono {
  const app = new Hono();

  app.onError((_error, context) =>
    context.html(
      <Layout title="Request error">
        <section class="not-found">
          <p class="eyebrow">Something went wrong</p>
          <h1>We could not complete that request</h1>
          <p>Please try again. No internal error details are available on this page.</p>
          <a href="/" role="button">
            Return home
          </a>
        </section>
      </Layout>,
      500,
    ),
  );

  app.notFound((context) => context.html(NotFoundPage(), 404));

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
      return context.html(NotFoundPage(), 404);
    }

    const agentAilmentIds = new Set(agent.ailments.map(({ id }) => id));
    const relatedTherapies = listTherapies(database).filter((therapy) =>
      therapy.ailments.some((ailment) => agentAilmentIds.has(ailment.id)),
    );

    return context.html(
      <Layout title={agent.name}>
        <AgentDetailPage agent={agent} therapies={relatedTherapies} />
      </Layout>,
    );
  });

  app.get('/agents/:id/appointments', (context) => {
    const notice = context.req.query('booked') === '1'
      ? 'booked'
      : context.req.query('cancelled') === '1'
        ? 'cancelled'
        : undefined;
    return renderAgentAppointments(
      context,
      database,
      context.req.param('id'),
      { notice },
    );
  });

  app.post('/agents/:id/appointments', async (context) => {
    const form = await context.req.parseBody();
    const slotId = typeof form.slotId === 'string' ? form.slotId : '';
    const notes = typeof form.notes === 'string' ? form.notes : '';
    const result = createAppointment(database, {
      agentId: context.req.param('id'),
      slotId,
      notes,
    });

    if (result.success) {
      return context.redirect(
        `/agents/${context.req.param('id')}/appointments?booked=1`,
        303,
      );
    }

    const status = result.error.toLowerCase().includes('conflict') ||
      result.error.toLowerCase().includes('unavailable')
      ? 409
      : 400;
    return renderAgentAppointments(
      context,
      database,
      context.req.param('id'),
      { error: result.error, status },
    );
  });

  app.post('/agents/:id/appointments/:appointmentId/cancel', (context) => {
    const agentId = context.req.param('id');
    const appointmentId = context.req.param('appointmentId');
    const appointment = getAppointment(database, appointmentId);
    if (!appointment || appointment.agentId !== agentId) {
      return context.html(NotFoundPage(), 404);
    }

    if (!cancelAgentAppointment(database, agentId, appointmentId)) {
      return renderAgentAppointments(context, database, agentId, {
        error: 'Only a scheduled appointment can be cancelled.',
        status: 409,
      });
    }

    return context.redirect(
      `/agents/${agentId}/appointments?cancelled=1`,
      303,
    );
  });

  app.get('/ailments', (context) =>
    context.html(
      <Layout title="Ailments">
        <AilmentsPage ailments={listAilments(database)} />
      </Layout>,
    ),
  );

  app.get('/therapies', (context) =>
    context.html(
      <Layout title="Therapies">
        <TherapiesPage therapies={listTherapies(database)} />
      </Layout>,
    ),
  );

  app.get('/therapies/:id', (context) => {
    const therapy = getTherapy(database, context.req.param('id'));
    if (!therapy) {
      return context.html(NotFoundPage(), 404);
    }
    return context.html(
      <Layout title={therapy.name}>
        <TherapyDetailPage therapy={therapy} />
      </Layout>,
    );
  });

  app.get('/dashboard', (context) =>
    context.html(
      <Layout title="Staff dashboard">
        <StaffDashboard appointments={listAppointments(database)} />
      </Layout>,
    ),
  );

  app.get('/dashboard/appointments/:id', (context) =>
    renderStaffAppointment(context, database, context.req.param('id'), {
      notice: context.req.query('updated') === '1'
        ? 'updated'
        : context.req.query('cancelled') === '1'
          ? 'cancelled'
          : undefined,
    }),
  );

  app.post('/dashboard/appointments/:id/status', async (context) => {
    const appointmentId = context.req.param('id');
    if (!getAppointment(database, appointmentId)) {
      return context.html(NotFoundPage(), 404);
    }
    const form = await context.req.parseBody();
    const status = typeof form.status === 'string' ? form.status : '';
    if (!isAppointmentStatus(status)) {
      return renderStaffAppointment(context, database, appointmentId, {
        error: 'Choose a valid appointment status.',
        status: 400,
      });
    }

    const result = updateAppointmentStatus(database, appointmentId, status);
    if (!result.success) {
      return renderStaffAppointment(context, database, appointmentId, {
        error: result.error,
        status: 409,
      });
    }
    return context.redirect(
      `/dashboard/appointments/${appointmentId}?updated=1`,
      303,
    );
  });

  app.post('/dashboard/appointments/:id/cancel', (context) => {
    const appointmentId = context.req.param('id');
    const appointment = getAppointment(database, appointmentId);
    if (!appointment) {
      return context.html(NotFoundPage(), 404);
    }
    if (appointment.status !== 'Scheduled') {
      return renderStaffAppointment(context, database, appointmentId, {
        error: 'Only a scheduled appointment can be cancelled.',
        status: 409,
      });
    }

    if (!cancelScheduledAppointment(database, appointmentId)) {
      return renderStaffAppointment(context, database, appointmentId, {
        error: 'Only a scheduled appointment can be cancelled.',
        status: 409,
      });
    }
    return context.redirect(
      `/dashboard/appointments/${appointmentId}?cancelled=1`,
      303,
    );
  });

  return app;
}

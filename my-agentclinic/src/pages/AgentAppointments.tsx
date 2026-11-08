import type { Appointment, AvailableSlot } from '../db/appointments';
import type { Agent } from '../db/queries';

type AgentAppointmentsPageProps = {
  agent: Agent;
  appointments: Appointment[];
  slots: AvailableSlot[];
  notice?: 'booked' | 'cancelled';
  error?: string;
};

function formatSlot(startsAt: string): string {
  return `${new Date(startsAt).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  })} UTC`;
}

export const AgentAppointmentsPage = ({
  agent,
  appointments,
  slots,
  notice,
  error,
}: AgentAppointmentsPageProps) => (
  <section>
    <a class="back-link" href={`/agents/${agent.id}`}>
      Back to {agent.name}
    </a>
    <header class="page-heading">
      <p class="eyebrow">Agent appointments</p>
      <h1>{agent.name}'s appointments</h1>
      <p>Choose a seeded future slot. Times are shown in UTC.</p>
    </header>

    {notice === 'booked' ? (
      <p class="success-state" role="status">
        Appointment booked. Your confirmation is listed below.
      </p>
    ) : null}
    {notice === 'cancelled' ? (
      <p class="success-state" role="status">
        Appointment cancelled. The availability slot has been released.
      </p>
    ) : null}
    {error ? (
      <p class="error-state" role="alert">
        {error}
      </p>
    ) : null}

    <article>
      <h2>Book a therapy</h2>
      {slots.length === 0 ? (
        <p class="empty-state" role="status">
          No future therapy slots are available right now.
        </p>
      ) : (
        <form method="post" action={`/agents/${agent.id}/appointments`}>
          <label for="slotId">Available therapy and time</label>
          <select id="slotId" name="slotId" required>
            <option value="">Choose a slot</option>
            {slots.map((slot) => (
              <option value={slot.id}>
                {slot.therapyName} ({slot.durationMinutes} min) —{' '}
                {formatSlot(slot.startsAt)} — Therapist {slot.therapistName}
              </option>
            ))}
          </select>
          <label for="notes">Optional notes</label>
          <textarea id="notes" name="notes" maxLength={1000} rows={3} />
          <small>Notes are fictional demo data only (up to 1,000 characters).</small>
          <button type="submit">Book appointment</button>
        </form>
      )}
    </article>

    <section>
      <h2>Your appointments</h2>
      {appointments.length === 0 ? (
        <p class="empty-state" role="status">
          This agent has no appointments yet.
        </p>
      ) : (
        <div class="card-grid">
          {appointments.map((appointment) => (
            <article class="appointment-card">
              <header>
                <h3>{appointment.therapyName}</h3>
                <span class="status-badge">{appointment.status}</span>
              </header>
              <dl class="detail-list">
                <div>
                  <dt>Date and time</dt>
                  <dd>{formatSlot(appointment.startsAt)}</dd>
                </div>
                <div>
                  <dt>Therapist</dt>
                  <dd>{appointment.therapistName}</dd>
                </div>
                <div>
                  <dt>Duration</dt>
                  <dd>{appointment.durationMinutes} minutes</dd>
                </div>
                <div>
                  <dt>Notes</dt>
                  <dd>{appointment.notes || 'None'}</dd>
                </div>
              </dl>
              {appointment.status === 'Scheduled' ? (
                <form
                  method="post"
                  action={`/agents/${agent.id}/appointments/${appointment.id}/cancel`}
                >
                  <button class="secondary" type="submit">
                    Cancel appointment
                  </button>
                </form>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  </section>
);

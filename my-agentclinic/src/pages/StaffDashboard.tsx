import type { Appointment, AppointmentStatus } from '../db/appointments';

type StaffDashboardProps = {
  appointments: Appointment[];
};

function formatAppointmentTime(startsAt: string): string {
  return `${new Date(startsAt).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  })} UTC`;
}

export const StaffDashboard = ({ appointments }: StaffDashboardProps) => (
  <section>
    <header class="page-heading">
      <p class="eyebrow">Staff area</p>
      <h1>Appointment dashboard</h1>
      <p>Review fictional appointments and update their status.</p>
    </header>
    {appointments.length === 0 ? (
      <p class="empty-state" role="status">
        There are no appointments to review.
      </p>
    ) : (
      <div class="table-wrap">
        <table>
          <caption>AgentClinic appointments</caption>
          <thead>
            <tr>
              <th scope="col">Date and time (UTC)</th>
              <th scope="col">Agent</th>
              <th scope="col">Therapy</th>
              <th scope="col">Therapist</th>
              <th scope="col">Status</th>
              <th scope="col">Details</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr>
                <td data-label="Date and time (UTC)">
                  {formatAppointmentTime(appointment.startsAt)}
                </td>
                <td data-label="Agent">{appointment.agentName}</td>
                <td data-label="Therapy">{appointment.therapyName}</td>
                <td data-label="Therapist">{appointment.therapistName}</td>
                <td data-label="Status">{appointment.status}</td>
                <td data-label="Details">
                  <a href={`/dashboard/appointments/${appointment.id}`}>
                    View appointment
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </section>
);

type StaffAppointmentPageProps = {
  appointment: Appointment;
  notice?: 'updated' | 'cancelled';
  error?: string;
};

const appointmentStatuses: AppointmentStatus[] = [
  'Scheduled',
  'Cancelled',
  'Completed',
];

export const StaffAppointmentPage = ({
  appointment,
  notice,
  error,
}: StaffAppointmentPageProps) => (
  <article class="profile-card">
    <a class="back-link" href="/dashboard">
      Back to dashboard
    </a>
    <header class="page-heading">
      <p class="eyebrow">Staff appointment details</p>
      <h1>{appointment.therapyName}</h1>
      <span class="status-badge">{appointment.status}</span>
    </header>
    {notice === 'updated' ? (
      <p class="success-state" role="status">
        Appointment status updated.
      </p>
    ) : null}
    {notice === 'cancelled' ? (
      <p class="success-state" role="status">
        Appointment cancelled and its slot released.
      </p>
    ) : null}
    {error ? (
      <p class="error-state" role="alert">
        {error}
      </p>
    ) : null}
    <dl class="detail-list profile-details">
      <div>
        <dt>Agent</dt>
        <dd>
          <a href={`/agents/${appointment.agentId}`}>{appointment.agentName}</a>
        </dd>
      </div>
      <div>
        <dt>Therapist</dt>
        <dd>{appointment.therapistName}</dd>
      </div>
      <div>
        <dt>Date and time</dt>
        <dd>{formatAppointmentTime(appointment.startsAt)}</dd>
      </div>
      <div>
        <dt>Duration</dt>
        <dd>{appointment.durationMinutes} minutes</dd>
      </div>
      <div>
        <dt>Notes</dt>
        <dd>{appointment.notes || 'None'}</dd>
      </div>
      <div>
        <dt>Status</dt>
        <dd>{appointment.status}</dd>
      </div>
    </dl>
    <form
      method="post"
      action={`/dashboard/appointments/${appointment.id}/status`}
    >
      <label for="status">Appointment status</label>
      <select id="status" name="status" required>
        {appointmentStatuses.map((status) => (
          <option value={status} selected={status === appointment.status}>
            {status}
          </option>
        ))}
      </select>
      <button type="submit">Update status</button>
    </form>
    {appointment.status === 'Scheduled' ? (
      <form
        method="post"
        action={`/dashboard/appointments/${appointment.id}/cancel`}
      >
        <button class="secondary" type="submit">
          Cancel appointment
        </button>
      </form>
    ) : null}
  </article>
);

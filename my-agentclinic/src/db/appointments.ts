import { randomUUID } from 'node:crypto';
import type { ClinicDatabase } from './database';

export type AppointmentStatus = 'Scheduled' | 'Cancelled' | 'Completed';

export interface Appointment {
  id: string;
  agentId: string;
  agentName: string;
  slotId: string;
  therapyId: string;
  therapyName: string;
  durationMinutes: number;
  therapistId: string;
  therapistName: string;
  startsAt: string;
  notes: string;
  status: AppointmentStatus;
}

export interface AvailableSlot {
  id: string;
  therapyId: string;
  therapyName: string;
  durationMinutes: number;
  therapistName: string;
  startsAt: string;
}

export type CreateAppointmentResult =
  | { success: true; appointmentId: string }
  | { success: false; error: string };

export type AppointmentStatusResult =
  | { success: true }
  | { success: false; error: string };

const appointmentSelect = `
  SELECT appointments.id, appointments.agent_id AS agentId, agents.name AS agentName,
         appointments.slot_id AS slotId, therapies.id AS therapyId,
         therapies.name AS therapyName,
         therapies.duration_minutes AS durationMinutes,
         therapists.id AS therapistId, therapists.name AS therapistName,
         availability_slots.starts_at AS startsAt, appointments.notes,
         appointments.status
  FROM appointments
  JOIN agents ON agents.id = appointments.agent_id
  JOIN availability_slots ON availability_slots.id = appointments.slot_id
  JOIN therapies ON therapies.id = availability_slots.therapy_id
  JOIN therapists ON therapists.id = availability_slots.therapist_id
`;

const availableSlotSelect = `
  SELECT slots.id, therapies.id AS therapyId, therapies.name AS therapyName,
         therapies.duration_minutes AS durationMinutes,
         therapists.name AS therapistName, slots.starts_at AS startsAt
  FROM availability_slots AS slots
  JOIN therapies ON therapies.id = slots.therapy_id
  JOIN therapists ON therapists.id = slots.therapist_id
  WHERE slots.starts_at > ?
    AND NOT EXISTS (
      SELECT 1
      FROM appointments
      JOIN availability_slots AS booked_slot
        ON booked_slot.id = appointments.slot_id
      JOIN therapies AS booked_therapy
        ON booked_therapy.id = booked_slot.therapy_id
      WHERE appointments.status <> 'Cancelled'
        AND (booked_slot.therapist_id = slots.therapist_id
             OR appointments.agent_id = ?)
        AND datetime(booked_slot.starts_at) <
            datetime(slots.starts_at, '+' || therapies.duration_minutes || ' minutes')
        AND datetime(booked_slot.starts_at,
                     '+' || booked_therapy.duration_minutes || ' minutes') >
            datetime(slots.starts_at)
    )
`;

export function listAvailableSlots(
  database: ClinicDatabase,
  agentId: string,
): AvailableSlot[] {
  return database
    .prepare<[string, string], AvailableSlot>(
      `${availableSlotSelect} ORDER BY slots.starts_at, therapies.name, therapists.name`,
    )
    .all(new Date().toISOString(), agentId);
}

export function listAgentAppointments(
  database: ClinicDatabase,
  agentId: string,
): Appointment[] {
  return database
    .prepare<[string], Appointment>(
      `${appointmentSelect}
       WHERE appointments.agent_id = ?
       ORDER BY availability_slots.starts_at`,
    )
    .all(agentId);
}

export function listAppointments(database: ClinicDatabase): Appointment[] {
  return database
    .prepare<[], Appointment>(
      `${appointmentSelect} ORDER BY availability_slots.starts_at, agents.name`,
    )
    .all();
}

export function getAppointment(
  database: ClinicDatabase,
  id: string,
): Appointment | undefined {
  return database
    .prepare<[string], Appointment>(`${appointmentSelect} WHERE appointments.id = ?`)
    .get(id);
}

export function createAppointment(
  database: ClinicDatabase,
  input: { agentId: string; slotId: string; notes: string },
): CreateAppointmentResult {
  const create = database.transaction(
    ({
      agentId,
      slotId,
      notes,
    }: typeof input): CreateAppointmentResult => {
      if (!agentId.trim()) {
        return { success: false, error: 'Choose an agent before booking.' };
      }
      if (!slotId.trim()) {
        return { success: false, error: 'Choose an available therapy time.' };
      }
      if (notes.length > 1000) {
        return { success: false, error: 'Notes must be 1,000 characters or fewer.' };
      }

      const agent = database
        .prepare<[string], { id: string }>('SELECT id FROM agents WHERE id = ?')
        .get(agentId);
      if (!agent) {
        return { success: false, error: 'That agent could not be found.' };
      }

      const slot = database
        .prepare<
          [string],
          { id: string; startsAt: string }
        >(
          `SELECT availability_slots.id, availability_slots.starts_at AS startsAt
           FROM availability_slots
           WHERE availability_slots.id = ?`,
        )
        .get(slotId);
      if (!slot || Date.parse(slot.startsAt) <= Date.now()) {
        return {
          success: false,
          error: 'That time is unavailable. Choose a future slot from the list.',
        };
      }

      const conflict = database
        .prepare<
          [string, string],
          { id: string }
        >(
          `SELECT appointments.id
           FROM appointments
           JOIN availability_slots AS booked_slot
             ON booked_slot.id = appointments.slot_id
           JOIN therapies AS booked_therapy
             ON booked_therapy.id = booked_slot.therapy_id
           JOIN availability_slots AS requested_slot
             ON requested_slot.id = ?
           JOIN therapies AS requested_therapy
             ON requested_therapy.id = requested_slot.therapy_id
           WHERE appointments.status <> 'Cancelled'
             AND (appointments.agent_id = ?
                  OR booked_slot.therapist_id = requested_slot.therapist_id)
             AND datetime(booked_slot.starts_at) <
                 datetime(requested_slot.starts_at,
                          '+' || requested_therapy.duration_minutes || ' minutes')
             AND datetime(booked_slot.starts_at,
                          '+' || booked_therapy.duration_minutes || ' minutes') >
                 datetime(requested_slot.starts_at)
           LIMIT 1`,
        )
        .get(slotId, agentId);

      if (conflict) {
        return {
          success: false,
          error: 'That time conflicts with another appointment. Choose a different slot.',
        };
      }

      const appointmentId = randomUUID();
      database
        .prepare(
          `INSERT INTO appointments (id, agent_id, slot_id, notes, status)
           VALUES (?, ?, ?, ?, 'Scheduled')`,
        )
        .run(appointmentId, agentId, slotId, notes.trim());

      return { success: true, appointmentId };
    },
  );

  return create.immediate(input);
}

export function cancelAgentAppointment(
  database: ClinicDatabase,
  agentId: string,
  appointmentId: string,
): boolean {
  const result = database
    .prepare(
      `UPDATE appointments
       SET status = 'Cancelled'
       WHERE id = ? AND agent_id = ? AND status = 'Scheduled'`,
    )
    .run(appointmentId, agentId);
  return result.changes === 1;
}

export function cancelScheduledAppointment(
  database: ClinicDatabase,
  appointmentId: string,
): boolean {
  const result = database
    .prepare(
      `UPDATE appointments
       SET status = 'Cancelled'
       WHERE id = ? AND status = 'Scheduled'`,
    )
    .run(appointmentId);
  return result.changes === 1;
}

export function updateAppointmentStatus(
  database: ClinicDatabase,
  appointmentId: string,
  status: AppointmentStatus,
): AppointmentStatusResult {
  const update = database.transaction(
    (): AppointmentStatusResult => {
      const current = database
        .prepare<
          [string],
          { agentId: string; slotId: string; status: AppointmentStatus; startsAt: string }
        >(
          `SELECT appointments.agent_id AS agentId, appointments.slot_id AS slotId,
                  appointments.status, availability_slots.starts_at AS startsAt
           FROM appointments
           JOIN availability_slots ON availability_slots.id = appointments.slot_id
           WHERE appointments.id = ?`,
        )
        .get(appointmentId);
      if (!current) {
        return { success: false, error: 'Appointment not found.' };
      }

      if (status === 'Scheduled' && current.status !== 'Scheduled') {
        if (Date.parse(current.startsAt) <= Date.now()) {
          return {
            success: false,
            error: 'A past slot cannot be scheduled again.',
          };
        }

        const conflict = database
          .prepare<
            [string, string, string],
            { id: string }
          >(
            `SELECT appointments.id
             FROM appointments
             JOIN availability_slots AS booked_slot
               ON booked_slot.id = appointments.slot_id
             JOIN therapies AS booked_therapy
               ON booked_therapy.id = booked_slot.therapy_id
             JOIN availability_slots AS requested_slot
               ON requested_slot.id = ?
             JOIN therapies AS requested_therapy
               ON requested_therapy.id = requested_slot.therapy_id
             WHERE appointments.id <> ?
               AND appointments.status <> 'Cancelled'
               AND (appointments.agent_id = ?
                    OR booked_slot.therapist_id = requested_slot.therapist_id)
               AND datetime(booked_slot.starts_at) <
                   datetime(requested_slot.starts_at,
                            '+' || requested_therapy.duration_minutes || ' minutes')
               AND datetime(booked_slot.starts_at,
                            '+' || booked_therapy.duration_minutes || ' minutes') >
                   datetime(requested_slot.starts_at)
             LIMIT 1`,
          )
          .get(current.slotId, appointmentId, current.agentId);
        if (conflict) {
          return {
            success: false,
            error: 'That appointment conflicts with another booking.',
          };
        }
      }

      database
        .prepare('UPDATE appointments SET status = ? WHERE id = ?')
        .run(status, appointmentId);
      return { success: true };
    },
  );

  return update.immediate();
}

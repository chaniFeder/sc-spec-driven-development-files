# MVP Requirements — AgentClinic

## Scope

Complete the AgentClinic MVP by preserving the Phase 1 foundation and Phase 2 shared layout, agent records, ailments, and responsive catalog pages, then adding the Phase 3 therapies catalog, Phase 4 appointment booking, and Phase 5 staff dashboard.

All rendering remains server-side using the existing TypeScript, Node.js, Hono, Hono JSX, SQLite (`better-sqlite3`), plain SQL migrations, PicoCSS, plain CSS, and Vitest stack. Use fictional or synthetic data only. Keep the UI responsive and consistent with the existing layout. Provide clear loading, empty, success, and error states where relevant.

## Functional Requirements

### Existing foundation: agents and ailments

- Preserve the existing home page and the completed Phase 2 shared layout, agents list/detail pages, ailments catalog, and persisted agent-to-ailment relationships.
- Preserve the existing fictional fixtures and read-only catalog behavior.
- Agent and ailment pages must continue to display their persisted relationships and clear empty/not-found states.

### Therapies catalog

- Persist therapies with a name, description, category, and duration.
- Persist explicit therapy-to-ailment associations.
- Provide a therapies list and a therapy detail page.
- Show related ailments and provide links that let agents explore suitable therapies from relevant agent/ailment contexts.
- Explain which ailments a therapy may help with using the explicit associations.
- Do not add an AI recommendation engine or automated medical decision-making.
- Use deterministic fictional therapy data and associations.

### Booking and appointment lifecycle

- Agents can book an appointment for an available therapy from their agent-facing context.
- Appointment booking includes the agent, therapy, date, time, and optional notes. The therapist is assigned by the selected seeded availability slot and is not an extra agent-entered booking field.
- Persist appointment statuses as `Scheduled`, `Cancelled`, or `Completed`.
- Show a clear confirmation after a successful booking.
- Agents can view appointments belonging to their selected agent context and cancel a scheduled appointment.
- Keep cancelled appointment records and statuses; cancellation releases the reserved availability so that it can be booked again.
- Staff can view appointment details, change appointment status, and cancel an appointment.
- Store appointments and availability in SQLite and preserve correct state on subsequent reads.

### Therapists and seeded availability

- Seed fictional therapists and future availability slots; no staff scheduling interface is required.
- Each bookable slot is associated with exactly one therapist and one therapy.
- Book only predefined, seeded future slots; do not accept arbitrary date/time values as availability.
- Use the selected therapy's duration when checking overlaps.
- Reject a booking if the selected therapist has another non-cancelled appointment whose time interval overlaps, or if the same agent has an overlapping appointment, even when assigned to a different therapist.
- Different therapists may accept appointments at the same time.
- Check availability when creating the appointment and reject conflicts with a clear message.
- A cancelled appointment does not block the slot. Only future slots can be booked.

### Staff dashboard and separation

- Provide a simple staff-facing dashboard listing appointments, their statuses, agents, and therapies.
- Provide appointment details and staff actions to update status or cancel.
- Keep staff-facing and agent-facing pages and workflows clearly separated.
- Authentication and authorization are explicitly out of scope. Do not imply that the application is secure for real users or real medical information.

### Cross-cutting behavior

- Keep all pages server-rendered and consistent with the existing shared layout and PicoCSS-based styling.
- Validate required fields, references, therapy/slot consistency, future slot eligibility, and availability. Show clear, understandable validation and conflict errors.
- Provide useful empty states for empty therapy catalogs, appointment lists, and dashboard data.
- Unknown routes and unknown resource IDs return appropriate 404 responses.
- Unexpected server errors must not expose stack traces or sensitive internal details to users.
- Use semantic, labeled controls and keyboard-usable navigation, forms, and status messages in the MVP workflows.

## Decisions

### Include roadmap phases 2–5

The MVP includes the Phase 2 responsive layout, agents, and ailments foundation; Phase 3 therapies; Phase 4 appointment booking; and Phase 5 staff dashboard. Phase 1 is already complete and must remain working. Phase 6 and Phase 7 are not being implemented as full roadmap phases; only the responsiveness, keyboard/form usability, clear error behavior, and 404/server-error expectations explicitly required for this MVP are in scope.

### Use explicit therapy associations

Therapy recommendations are represented only by persisted therapy-to-ailment associations. The application does not infer a treatment, diagnose, or make automated medical decisions.

### Assign therapists through seeded slots

Keep the roadmap's therapist domain. Each seeded future availability slot determines the therapist and therapy for a booking. Agents choose an available slot in the context of a therapy; they do not choose a therapist separately. This fulfills the requested agent booking fields while preserving therapist scheduling and conflict checks.

### Check interval overlaps

Treat appointments as intervals whose length is the therapy duration. A candidate booking is unavailable if it overlaps another appointment for the same therapist or the same agent. Different therapists may host simultaneous appointments. Cancelled appointments release both therapist and agent time. Do not permit a booking for a past slot.

### Keep scheduling intentionally simple

Use seeded future availability only. Do not add a staff interface for managing schedules, arbitrary time entry, external calendar services, or complex recurring availability.

### Keep roles distinct without authentication

Expose separate agent-facing and staff-facing routes/pages, but do not add login, identity verification, access control, or claims of production security. Agent appointment views are scoped to the agent context selected in the application.

### Preserve fictional-only boundaries

Use fictional or synthetic agents, ailments, therapies, therapists, appointments, and notes. AgentClinic is a fictional learning/demo application, not a real medical service; it must not handle real patient data.

## Out of Scope

- Authentication, authorization, real-user identity, or real medical/patient data.
- AI recommendation engines, automated diagnoses, or treatment decisions.
- Staff scheduling or availability-management UI.
- Advanced analytics, reporting, or complex staff management workflows.
- External services, email notifications, or unrelated features.
- Full Phase 6 polish/accessibility audit and full Phase 7 logging/hardening scope beyond the explicit MVP acceptance criteria above.

## Context

The roadmap marks Phase 1 complete and Phase 2 as the existing base layout, agents, and ailments phase. The existing Phase 1/2 feature specifications define the current architecture, seed data, routes, and validation conventions. This MVP adds therapies, booking, and staff operations without replacing that foundation.

The target audience is students learning spec-driven development and developers demonstrating AI coding. Prefer dependable and understandable workflows over breadth. The application is fictional and must not provide real medical services or handle real patient data.

## Stakeholder Decisions

- Include Phases 2, 3, 4, and 5 in MVP scope; retain completed Phase 1 behavior.
- Therapy fields: name, description, category, duration, and explanation of applicable ailments.
- Therapy-to-ailment matching is explicit and relational; no AI recommendation engine.
- Booking fields: agent, therapy, date, time, and optional notes; therapist comes from a selected seeded slot.
- Slots are predefined and seeded in the future. Same-therapist or same-agent interval overlaps are rejected using therapy duration; different therapists can accept concurrent bookings.
- Cancelled appointments release their slots. Agents may view and cancel scheduled appointments; staff may view, update status, or cancel.
- No authentication/authorization, scheduling UI, advanced analytics, external services, or real data.
- The MVP must pass the specified automated, end-to-end, error, UI/accessibility, and scope checks.
- Do not merge automatically. Present the implementation summary, results, and remaining limitations and wait for explicit approval before merging into `main` and deleting the MVP branch.

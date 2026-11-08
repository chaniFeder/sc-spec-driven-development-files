# MVP Plan — AgentClinic

Deliver the selected roadmap scope in independently testable groups. Preserve the completed Phase 1 and Phase 2 behavior and architecture; implement only gaps in those foundations before adding the new MVP workflows.

## Group 1 — Baseline and Existing Foundation

1. Run the existing Vitest suite and TypeScript check; record any baseline failures before making implementation changes.
2. Verify the current shared layout, responsive CSS, SQLite migrations/seeds, agents pages, ailments catalog, and agent-ailment relationships against the Phase 2 specification.
3. Keep the existing home route, content, shared navigation, fictional seed records, and data relationships working. Add or repair only what is needed for the MVP.

## Group 2 — Therapies Catalog

4. Add SQLite persistence and migrations for therapies and explicit many-to-many therapy-to-ailment associations.
5. Define therapy records with a name, description, category, duration, and deterministic fictional seed data; seed explicit ailment associations without automated recommendations.
6. Add a therapies list page and a therapy detail page showing therapy information and related ailments.
7. Link agents and ailments to suitable therapies using the persisted associations.
8. Test migration/schema behavior, seeded relationships, list and detail routes, unknown therapy IDs, and empty states.

## Group 3 — Therapists, Availability, and Booking Persistence

9. Add fictional therapist records and seeded future availability slots. Each slot identifies one therapist, one therapy, and a start time; do not add a staff scheduling interface.
10. Add appointment persistence for the agent, selected availability slot, optional notes, and `Scheduled`, `Cancelled`, or `Completed` status.
11. Implement booking validation for required and related records, future slots, therapy/slot consistency, and conflicts. A therapist and an agent must each be free for the full therapy duration; different therapists may be booked at the same time.
12. Ensure cancelled appointments release their slots. Reject invalid or unavailable slots with clear user-facing messages.
13. Test booking success, invalid input, past or mismatched slots, therapist and agent overlap boundaries, concurrent availability checks as applicable to the implementation, and cancellation/rebooking.

## Group 4 — Agent Appointment Workflows

14. Add an agent-facing booking flow from the agent's context, with therapy and seeded future slot selection plus optional notes.
15. Show a clear success confirmation and list the appointments associated with the selected agent.
16. Allow an agent to cancel only a scheduled appointment in that agent's context; retain the appointment record and status.
17. Test agent-specific appointment listing, successful booking, validation and conflict feedback, cancellation, persistence after a fresh read, and empty states.

## Group 5 — Staff Dashboard

18. Add a clearly staff-facing dashboard that lists appointments, statuses, agents, and therapies.
19. Add appointment detail and staff actions to change status or cancel an appointment.
20. Test dashboard and detail rendering, status updates, cancellation, unknown appointment IDs, and persistence.

## Group 6 — Integrated MVP Validation

21. Run the full Vitest suite and `npm run typecheck`; confirm existing Phase 1 and Phase 2 behavior remains intact.
22. Verify the end-to-end agent browse, book, view, cancel, and staff review/update workflow using SQLite-backed data.
23. Inspect the principal agent and staff workflows at desktop and mobile viewport sizes; verify keyboard use, labeled forms, understandable status/errors, and no horizontal overflow.
24. Confirm unknown routes/resources return appropriate 404 responses and unexpected server errors do not expose stack traces or sensitive internals.
25. Review the complete diff against `main` for MVP scope, data integrity, accessibility, and security concerns. Report results and limitations; do not merge or delete the branch until the user explicitly approves.

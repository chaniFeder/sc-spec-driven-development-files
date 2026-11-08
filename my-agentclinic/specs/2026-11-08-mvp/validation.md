# MVP Validation — AgentClinic

## Definition of Done

### 1. Automated checks and database

- All existing and new Vitest tests pass with `npm test`.
- `npm run typecheck` exits with code 0.
- Database migrations and seed scripts run successfully against a clean database.
- Tests cover therapy list/detail pages and relationships, appointment creation and validation, slot availability and interval conflicts, cancellation/rebooking, staff status updates, persistence, unknown resources, and empty states.
- Existing Phase 1 and Phase 2 tests pass without regressions.

### 2. End-to-end workflow

Demonstrate and verify that:

- An agent can browse therapies and view a therapy's details and related ailments.
- An agent can book a seeded, future slot for an available therapy and sees a clear confirmation.
- Booking rejects arbitrary, past, mismatched, or unavailable slots and same-therapist or same-agent interval overlaps; different therapists can accept appointments at the same time.
- Therapy duration is used when testing overlap, and cancellation releases availability.
- An agent can view appointments in their selected agent context and cancel a scheduled appointment.
- Staff can view appointments and details, change status, and cancel.
- Appointment, status, and cancellation changes persist in SQLite and remain correct after a fresh page request/read.

### 3. Error handling and states

- Missing or invalid required fields display clear validation messages.
- Unavailable slots and booking conflicts fail gracefully without creating a conflicting appointment.
- Unknown routes and unknown agent, therapy, or appointment IDs return appropriate 404 responses.
- Empty therapy catalogs, agent appointment lists, and staff appointment lists show useful empty states.
- Unexpected server errors do not expose stack traces or sensitive internal details in user-facing responses.
- Success, empty, and error states are understandable and consistent with the shared layout.

### 4. UI, responsiveness, and accessibility

- Verify the main agent and staff workflows in a desktop browser and at a mobile-sized viewport.
- Pages remain usable without horizontal overflow or broken layout.
- Navigation, forms, buttons, and status/error messages are usable with keyboard navigation.
- Form controls have appropriate labels, and validation errors are understandable.
- UI remains consistent with the existing PicoCSS-based shared layout.

### 5. Scope and compatibility

- Only fictional/synthetic data is used.
- No authentication, external services, AI recommendation engine, scheduling-management UI, advanced analytics/reporting, or unrelated features are introduced.
- Phase 1 and Phase 2 behavior, routes, and data relationships remain intact.
- Review the complete diff against `main`; resolve important implementation, security, data-integrity, and test issues.

### 6. Merge readiness

- Run the full automated checks after the final implementation changes.
- Report the implementation summary, test results, and remaining limitations.
- Do not merge into `main` or delete the MVP branch until the user gives explicit approval.

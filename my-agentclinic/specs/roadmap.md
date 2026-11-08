# Roadmap

Phases are intentionally small — each one is a shippable slice of work, independently reviewable and testable.

## Phase 1 — Hello Hono

- Install and configure Hono with `tsx` dev server.
- Add a single `/` route that renders a minimal Hono JSX HTML page with an `AgentClinic` heading and a short tagline.
- Do not add a shared layout or CSS in this phase.
- Confirm TypeScript types work end-to-end.

## Phase 2 — Base Layout

- Create a server-side JSX layout component (header, nav, main, footer).
- Add basic CSS (custom properties, reset, typography).
- Render all routes inside the shared layout.

## Phase 3 — Agent List

- Add a SQLite database and first migration (`agents` table).
- Seed a handful of fictional agents.
- Add `/agents` page listing all agents.

## Phase 4 — Agent Detail

- Add `/agents/:id` page showing a single agent's profile.
- Show name, model type, current status, and presenting complaints.

## Phase 5 — Ailments Catalog

- Add an `ailments` table and fictional seed data (e.g., "context-window claustrophobia", "prompt fatigue").
- Add `/ailments` list page.
- Link agents to one or more ailments.

## Phase 6 — Therapies Catalog

- Add a `therapies` table and seed data.
- Add `/therapies` list page.
- Map ailments to recommended therapies.

## Phase 7 — Appointment Booking

- Add a `therapists` table and seed it with fictional therapists if it does not already exist.
- Add an `appointments` table referencing an agent, an existing therapist, a datetime, and a status.
- Add a form to book an appointment from an agent's detail page.
- Add basic validation and a confirmation page.

## Phase 8 — Staff Dashboard

- Add `/dashboard` with summary counts for agents and open appointments.
- Add simple table views for staff to manage records.

## Phase 9 — Polish & Accessibility

- Add responsive layout for Steve's modern-browser requirement.
- Audit semantic HTML.
- Add keyboard navigation and focus styles.

## Phase 10 — Hardening

- Add 404 and 500 error pages.
- Sanitize input on all forms.
- Add basic logging middleware.

Later phases (not yet planned): authentication, email notifications, therapist profiles, reporting.

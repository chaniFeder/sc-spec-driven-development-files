# Roadmap

Phases are independently reviewable and testable. Phase 2 intentionally groups the base layout, agent records, and ailments catalog. Every user-facing page must be responsive and usable on mobile, tablet, and desktop screens.

## Phase 1 — Hello Hono (Complete)

- Install and configure Hono with `tsx` dev server.
- Add a single `/` route that renders a minimal Hono JSX HTML page with an `AgentClinic` heading and a short tagline.
- Include a viewport meta tag so the page uses the device's actual viewport width.
- Validate the root response and single-route scope with Vitest tests.
- Do not add a shared layout or CSS in this phase.
- Confirm TypeScript types work end-to-end.

## Phase 2 — Base Layout, Agents & Ailments

- Create a server-side JSX layout component (header, nav, main, footer).
- Add mobile-first CSS (custom properties, reset, typography, and responsive layout rules).
- Render all routes inside the shared layout.
- Add a SQLite database and first migration (`agents` table).
- Seed a handful of fictional agents.
- Add `/agents` page listing all agents.
- Add `/agents/:id` page showing a single agent's profile.
- Show name, model type, current status, and presenting complaints.
- Add an `ailments` table and fictional seed data (e.g., "context-window claustrophobia", "prompt fatigue").
- Add `/ailments` list page.
- Link agents to one or more ailments.

## Phase 3 — Therapies Catalog

- Add a `therapies` table and seed data.
- Add `/therapies` list page.
- Map ailments to recommended therapies.

## Phase 4 — Appointment Booking

- Add a `therapists` table and seed it with fictional therapists if it does not already exist.
- Add an `appointments` table referencing an agent, an existing therapist, a datetime, and a status.
- Add a form to book an appointment from an agent's detail page.
- Add basic validation and a confirmation page.

## Phase 5 — Staff Dashboard

- Add `/dashboard` with summary counts for agents and open appointments.
- Add simple table views for staff to manage records.

## Phase 6 — Polish & Accessibility

- Audit and refine responsive behavior across phone, tablet, and desktop widths.
- Audit semantic HTML.
- Add keyboard navigation and focus styles.

## Phase 7 — Hardening

- Add 404 and 500 error pages.
- Sanitize input on all forms.
- Add basic logging middleware.

Later phases (not yet planned): authentication, email notifications, therapist profiles, reporting.

# Phase 2 Plan — Base Layout, Agents & Ailments

Implement the groups in order. Each group should be independently testable, and the final group validates the integrated phase.

## Group 1 — Shared Responsive Layout

1. Add a server-rendered Hono JSX layout with a header, navigation, main content area, and footer; link Home (`/`), Agents (`/agents`), and Ailments (`/ailments`) in the shared navigation.
2. Use PicoCSS as the base stylesheet and add project-specific mobile-first CSS overrides with custom properties and responsive layout rules in `public/styles.css`. Install `@picocss/pico` as a runtime dependency, update `package.json` and `package-lock.json`, serve the package stylesheet at `/styles/pico.min.css` through the Node adapter's static-file middleware, and link both stylesheets from each page without a build step or CDN.
3. Render the existing home page and all new pages inside the shared layout, with a viewport meta tag on every page. Preserve `GET /`, its `AgentClinic` heading, and its exact tagline, "Where AI agents come to get better."

## Group 2 — SQLite Data and Seeds

4. Install `better-sqlite3` as a runtime dependency and update `package.json` and `package-lock.json`; add only any TypeScript typings required for type-checking.
5. Store database code under `src/db/`, plain SQL migrations in `src/db/migrations/`, and seed logic in `src/db/seed.ts`. Store the generated database at `data/agentclinic.sqlite` and keep it and its journal files out of version control.
6. Create the first migration for the `agents` table only; create a later migration for the `ailments` table and the many-to-many association table, with foreign-key integrity.
7. Define ailments with an ID, name, and description. Seed the known fictional fixtures: agents Aster-01 and Mica-02; ailments "context-window claustrophobia" and "prompt fatigue". Associate Aster-01 with context-window claustrophobia and Mica-02 with both ailments so every seeded agent and ailment has at least one association.
8. Test migration order and schema, verify the known seed fixtures, and test persistence and relationship integrity. Use isolated test databases and test-only unassociated records where needed; keep production seeds associated.

## Group 3 — Agents List

9. Add `GET /agents` to list agents from SQLite.
10. Render each agent's name, model type, current status, presenting complaints, and links to agent detail pages.
11. Add route and rendered-page tests, including the empty-list state using an isolated test database.

## Group 4 — Agent Detail

12. Add `GET /agents/:id` to show a single agent profile from SQLite.
13. Show the agent's name, model type, current status, presenting complaints, and associated ailments.
14. Return HTTP `404` for an unknown agent ID and test successful and not-found responses.

## Group 5 — Ailments Catalog

15. Add `GET /ailments` to list ailments from SQLite, including each ailment's name and description.
16. Show associated agents for each ailment, using links to agent detail pages where appropriate.
17. Add route and rendered-page tests, including the empty-list state and a test-only unassociated ailment.

## Group 6 — Integrated Validation

18. Run the full Vitest suite and TypeScript type check; verify persisted relationships appear on agent detail and ailments pages.
19. Verify the home, agents list, agent detail, and ailments catalog at mobile, tablet, and desktop widths, including no horizontal overflow and consistent shared layout.
20. Review the diff for Phase 2 scope only; do not commit or merge until validation passes and the user approves.

# Phase 2 Requirements — Base Layout, Agents & Ailments

## Scope

Build the shared responsive application layout, establish SQLite persistence for agents and ailments, and provide read-only catalog and profile pages.

- Add a server-rendered Hono JSX layout with a header, navigation, main content, and footer.
- Link Home (`/`), Agents (`/agents`), and Ailments (`/ailments`) in the shared navigation.
- Preserve `GET /` and its `AgentClinic` heading and exact tagline, "Where AI agents come to get better.", within the shared layout.
- Use PicoCSS as the base stylesheet, with project-specific mobile-first CSS overrides using custom properties and responsive layout rules in `public/styles.css`.
- Install `@picocss/pico` as a runtime dependency and update `package.json` and `package-lock.json`. Serve the PicoCSS package stylesheet at `/styles/pico.min.css` through the Node adapter's static-file middleware; serve the project stylesheet at `/styles.css` and link both from every page. Do not use a CDN or add a CSS build step.
- Use SQLite through `better-sqlite3` and plain SQL migrations. Install it as a runtime dependency and update `package.json` and `package-lock.json`; add only TypeScript typings required for type-checking.
- Store database code under `src/db/`, migration files under `src/db/migrations/`, seed logic in `src/db/seed.ts`, and the generated database at `data/agentclinic.sqlite`. Keep the generated database and its SQLite journal files out of version control.
- Preserve the migration sequence: the first migration creates the `agents` table only; a later migration creates the `ailments` table and many-to-many association table, with foreign-key integrity.
- Define ailments with an ID, name, and description.
- Seed known fictional agents and ailments. Every seeded agent and ailment must have at least one association.
- Add `GET /agents` to list agents and `GET /agents/:id` to show an individual agent.
- Show an agent's name, model type, current status, presenting complaints, and associated ailments.
- Add `GET /ailments` to list ailments with their descriptions and associated agents.
- Model agent-to-ailment associations as many-to-many and display them consistently from persisted SQLite data.
- Include clear empty states for empty catalogs and return HTTP `404` for an unknown agent ID.
- Include a viewport meta tag and shared layout on every user-facing page.

All pages are read-only and use fictional or synthetic data only.

## Decisions

### Follow the existing stack

Use TypeScript, Node.js, Hono, Hono JSX, PicoCSS with plain CSS overrides, SQLite via `better-sqlite3`, plain SQL migrations, and Vitest. Use the existing Node adapter's static-file middleware for CSS. PicoCSS is the explicitly requested CSS dependency; do not introduce an ORM, frontend framework, CSS build step, CDN dependency, or other unnecessary package.

### Keep the data fictional and the pages read-only

Seed only fictional agents and ailments. This phase does not add create, update, or delete flows.

### Use known fictional seed fixtures

Seed these known fictional records:

| Agent ID | Agent name | Associated ailments |
|---|---|---|
| `agent-aster-01` | Aster-01 | context-window claustrophobia |
| `agent-mica-02` | Mica-02 | context-window claustrophobia; prompt fatigue |

| Ailment ID | Name | Description |
|---|---|---|
| `context-window-claustrophobia` | context-window claustrophobia | A fictional complaint about feeling constrained by limited working context. |
| `prompt-fatigue` | prompt fatigue | A fictional complaint about fatigue from repeated prompt revisions. |

Assign deterministic fictional model types, statuses, and presenting complaints to the agents. These are fictional labels, not real medical diagnoses or services.

### Keep agent-ailment links relational

Store associations using a SQLite many-to-many relationship, and query that persisted relationship for both agent and ailment pages. Do not duplicate association data in page-only seed constants. Every seeded agent and ailment has at least one association; use isolated test fixtures for unassociated agents or ailments and for empty-catalog states.

### Keep this phase bounded

Do not implement therapies, appointment booking, a staff dashboard, authentication, or features belonging to later roadmap phases.

### Preserve clear user-facing states

Catalog pages must render a clear empty state when their data set is empty. The agent detail route must handle an unknown ID with a clear not-found response.

## Context

This is the next incomplete phase in `specs/roadmap.md`: Phase 1 (Hello Hono) is complete, and Phase 2 establishes the shared responsive foundation and the first domain data and pages. Phase 3 and later capabilities remain out of scope.

The application serves students learning spec-driven development and developers demonstrating AI coding. Keep the interface dependable, understandable, responsive on mobile, tablet, and desktop, and limited to the fictional AgentClinic domain. It must not provide real medical services or handle real patient data.

## Stakeholder Decisions

- Implement the sequence: shared layout and CSS; agents migration; ailments and association migration plus seeds; agents list; agent detail; ailments catalog; integrated relationship checks.
- Keep each task group independently testable.
- Follow the roadmap and existing project conventions exactly.
- Do not commit or merge until validation passes and the user approves.

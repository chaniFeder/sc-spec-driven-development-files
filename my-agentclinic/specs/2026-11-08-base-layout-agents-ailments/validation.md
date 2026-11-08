# Phase 2 Validation — Base Layout, Agents & Ailments

## Definition of Done

### 1. Shared layout and responsive pages

- Tests verify that the shared layout renders the header, Home (`/`), Agents (`/agents`), and Ailments (`/ailments`) navigation links, main content, footer, PicoCSS and project stylesheet links, and viewport meta tag.
- `GET /` remains available, returns HTTP `200` HTML, and renders the existing `AgentClinic` heading and exact tagline, "Where AI agents come to get better.", inside the shared layout.
- The agents list, agent detail, and ailments catalog also use the shared layout.
- The PicoCSS package stylesheet is served successfully at `/styles/pico.min.css` and the project overrides at `/styles.css` through the Node adapter's static-file middleware, without a build step or CDN.
- Inspect the home page and all Phase 2 pages at mobile, tablet, and desktop viewport widths. Confirm they remain readable and usable without horizontal overflow.

### 2. Database, migrations, and fictional seeds

- Vitest tests apply the first migration and verify it creates the `agents` table only.
- Tests apply the later migration and verify the `ailments` table and many-to-many association table, including foreign-key integrity.
- Tests verify migrations are in `src/db/migrations/`, seed logic is in `src/db/seed.ts`, and the default generated database path is `data/agentclinic.sqlite`.
- Tests verify the known fictional fixtures: agents `agent-aster-01` / Aster-01 and `agent-mica-02` / Mica-02; ailments `context-window-claustrophobia` / context-window claustrophobia / "A fictional complaint about feeling constrained by limited working context." and `prompt-fatigue` / prompt fatigue / "A fictional complaint about fatigue from repeated prompt revisions."
- Tests verify every seeded agent and ailment has at least one persisted association and that data persists when read back from SQLite.
- Use isolated test databases and test-only unassociated records to verify relationship edge cases and empty-catalog states; do not add unassociated records to production seeds.
- Confirm generated SQLite database and journal files are excluded from version control.

### 3. Routes and rendered content

- `GET /` returns HTTP `200` and preserves the existing home content in the shared layout.
- `GET /agents` returns successful HTML with agent names, model types, statuses, presenting complaints, and links to details.
- `GET /agents/:id` returns a successful HTML response for an existing agent and displays its associated ailments.
- `GET /agents/:id` returns HTTP `404` for an unknown ID.
- `GET /ailments` returns successful HTML with each ailment's name, description, and associated agents.
- Tests verify empty agent and ailment catalogs render clear empty states and that test-only unassociated agents or ailments are handled clearly.
- Tests verify relationships are displayed consistently on agent detail and ailment catalog pages.
- Tests verify the expected Phase 2 GET routes (`/`, `/agents`, `/agents/:id`, `/ailments`) are present and that no write routes are added.

### 4. Standard project checks

Run:

```text
npm test
npm run typecheck
```

Both commands must exit with code 0.

### 5. Scope and merge readiness

- Review changes for consistency with `specs/mission.md`, `specs/tech-stack.md`, and the Phase 2 roadmap.
- Confirm `better-sqlite3` and any required TypeScript typings are recorded in the package manifest and lockfile.
- Confirm `@picocss/pico` is recorded as a runtime dependency in the package manifest and lockfile.
- Confirm no therapies, appointment booking, dashboard, authentication, unrelated changes, or regressions to existing behavior were introduced.
- Do not commit or merge until all validation passes and the user approves the completed work.

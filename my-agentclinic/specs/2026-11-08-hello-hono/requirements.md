# Phase 1 Requirements — Hello Hono

## Scope

Configure a minimal Hono server for Node.js using the project's TypeScript stack and `@hono/node-server`. Define one `GET /` route in `src/app.tsx` that renders the `Home` component from `src/pages/Home.tsx`; `src/index.tsx` starts the app with the Node.js adapter. The component renders a minimal Hono JSX HTML page with a responsive viewport meta tag, an `AgentClinic` heading, and the tagline "Where AI agents come to get better." The page must use the device viewport and remain readable without CSS. Verify the route with Vitest, confirm that the server starts, and type-check the project.

## Out of Scope

- No shared layout or navigation (Phase 2).
- No CSS (Phase 2).
- No database, additional routes, authentication, or other features.
- No CI pipeline.

## Decisions

### Pin Hono version

Record `hono` `4.12.9` and `@hono/node-server` `1.19.12` in `package.json` without `^` or `~` range prefixes.

### Start the Node.js server

Import `serve` from `@hono/node-server` and use it to start the Hono app on port 3000.

### Keep TypeScript strict

Keep `"strict": true` in `tsconfig.json` and confirm the project type-checks.

### Configure Hono JSX

Set `"jsx": "react-jsx"` and `"jsxImportSource": "hono/jsx"` in `tsconfig.json`.

### Keep the scripts aligned with the entry point

Set the `dev` and `start` scripts to `tsx watch src/index.tsx` and `tsx src/index.tsx`, respectively. Keep the `typecheck` script unchanged and set `test` to `vitest run`.

### Validate the root route with Vitest

Add a test in `src/app.test.tsx` that invokes the Hono app with its request API and verifies the root route returns HTTP 200 HTML containing the AgentClinic heading and exact tagline. Add a test in `src/app.routes.test.tsx` that verifies the app registers only `GET /`.

### Render the page with Hono JSX

The `GET /` route in `src/app.tsx` renders the `Home` component from `src/pages/Home.tsx` and returns HTML, not a plain-text response. The page contains an `<h1>` with `AgentClinic`, the tagline "Where AI agents come to get better.", and `<meta name="viewport" content="width=device-width, initial-scale=1">`. Do not include a shared layout or CSS.

## Context

This phase establishes the smallest working server-rendered TypeScript application: Node.js runs the TypeScript dev server, Hono serves one route, and Hono JSX renders the page.

## Stakeholder Notes

- **Mary** requires a reliable TypeScript-based application; this phase confirms the server and TypeScript toolchain work.
- The agent and staff workflows, shared layout, and visual polish are addressed in later roadmap phases.

# Phase 1 Plan — Hello Hono

## Group 1 — Package Setup

1. Add `hono` (`4.12.9`) and `@hono/node-server` (`1.19.12`) as dependencies, pinning their exact versions without a `^` or `~` prefix.
2. Use the existing `tsx` development tooling and strict TypeScript configuration.
3. Configure TypeScript for Hono JSX with `"jsx": "react-jsx"` and `"jsxImportSource": "hono/jsx"`.

## Group 2 — Application Entry Point

4. Create a minimal Hono application in `src/app.tsx`.
5. In `src/app.tsx`, define a single `GET /` route that renders the `Home` component from `src/pages/Home.tsx`.
6. In `src/index.tsx`, import the app and `serve` from `@hono/node-server`, then start the app on port 3000.

## Group 3 — Home Page

7. Create `src/pages/Home.tsx` with minimal Hono JSX, a responsive viewport meta tag, an `AgentClinic` heading, and the tagline "Where AI agents come to get better."

## Group 4 — Scripts and Verification

8. Keep the `dev`, `start`, `typecheck`, and `test` scripts aligned with their entry points; `test` runs `vitest run`.
9. Add Vitest tests for the root response in `src/app.test.tsx` and the single-route scope in `src/app.routes.test.tsx`.
10. Run `npm run typecheck`, `npm test`, and verify the server and root route using `npm run dev`.

Do not add a shared layout, CSS, database, or additional routes in this phase. The viewport meta tag provides the responsive baseline; later phases add responsive CSS as needed.

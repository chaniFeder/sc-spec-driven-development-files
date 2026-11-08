# Phase 1 Plan — Hello Hono

## Group 1 — Package Setup

1. Add `hono` (`4.12.9`) and `@hono/node-server` (`1.19.12`) as dependencies, pinning their exact versions without a `^` or `~` prefix.
2. Use the existing `tsx` development tooling and strict TypeScript configuration.
3. Configure TypeScript for Hono JSX with `"jsx": "react-jsx"` and `"jsxImportSource": "hono/jsx"`.

## Group 2 — Application Entry Point

4. Create a minimal Hono application in `src/index.tsx`.
5. In `src/index.tsx`, define a single `GET /` route that renders the `Home` component from `src/pages/Home.tsx`.
6. Import `serve` from `@hono/node-server` and start the app on port 3000.

## Group 3 — Home Page

7. Create `src/pages/Home.tsx` with minimal Hono JSX containing an `AgentClinic` heading and the tagline "Where AI agents come to get better."

## Group 4 — Scripts and Verification

8. Update only the existing `dev` and `start` scripts to `tsx watch src/index.tsx` and `tsx src/index.tsx`; keep the existing `typecheck` script unchanged.
9. Run `npm run typecheck` and verify the server and root route using `npm run dev`.

Do not add a shared layout, CSS, database, or additional routes in this phase.

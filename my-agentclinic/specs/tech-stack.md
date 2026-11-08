# Tech Stack

AgentClinic is a server-side TypeScript application. All rendering happens on the server; the browser receives plain HTML that works well and looks good. All user-facing pages must adapt to mobile, tablet, and desktop screens.

## Core

| Layer | Choice | Rationale |
|---|---|---|
| Language | TypeScript | Type safety end-to-end; satisfies Mary's requirement |
| Runtime | Node.js | Stable, well-supported, vast ecosystem |
| Server framework | **Hono** | Lightweight, TypeScript-first, fast, excellent DX; routes and middleware feel natural |
| Templating | Hono JSX (server-side) | JSX without React overhead; components are just functions |
| CSS | Plain CSS + CSS custom properties | No build step required; supports mobile-first responsive layouts without adding a framework |

## Recommended: Hono

[Hono](https://hono.dev) is chosen over Express/Fastify because:

- First-class TypeScript with zero config
- Built-in JSX renderer for server-side HTML
- Middleware model is simple and composable
- Runs on Node, Deno, Bun, and edge runtimes without changes

## Data

- **SQLite** (via `better-sqlite3`) for local development and early production — simple, embedded, no infrastructure
- Migrations via plain SQL files; no ORM to start

## Responsive UI

- Include a viewport meta tag on every page.
- Build layouts mobile-first with fluid sizing and CSS media queries where needed.
- Keep content readable and usable on phone, tablet, and desktop widths without horizontal overflow.

## Testing

- **Vitest** — fast, TypeScript-native, compatible with the rest of the stack; use its tests to validate application behavior.
- Run the validation suite with `npm test`, which executes `vitest run`.

## Tooling

- `tsx` for development (run TypeScript directly, no build step needed)
- `tsc` for type checking
- `prettier` for formatting

## What We Are Not Using

- No React, Vue, or Svelte — server-side rendering keeps the stack simple
- No ORM — SQL is sufficient at this scale
- Docker is outside the scope of the current course phases.

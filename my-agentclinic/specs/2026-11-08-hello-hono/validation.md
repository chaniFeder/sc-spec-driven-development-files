# Phase 1 Validation — Hello Hono

## Definition of Done

### 1. TypeScript compiles

Run:

```text
npm run typecheck
```

The command exits with code 0.

### 2. Vitest validates the root route

Run:

```text
npm test
```

Both tests pass. The route test confirms that the in-memory `GET /` request returns HTTP `200`, HTML, the viewport meta tag, the `AgentClinic` heading, and the exact tagline; the scope test confirms that the app registers only `GET /`.

### 3. Server starts

Run:

```text
npm run dev
```

The server starts without errors and listens on the development port (default 3000).

### 4. Root route returns the page

Request:

```text
curl -i http://localhost:3000/
```

The response has HTTP status `200 OK`, is HTML, and contains:

- An `<h1>` element with the text `AgentClinic`.
- The exact tagline `Where AI agents come to get better.`
- A viewport meta tag with `width=device-width, initial-scale=1`.
- HTML rendered by the `Home` component from `src/pages/Home.tsx`, called by the `GET /` route in `src/app.tsx`.

### 5. Dependencies are pinned

`package.json` lists `hono` at `4.12.9` and `@hono/node-server` at `1.19.12`, without version-range prefixes.

### 6. Scripts use the TSX entry point

`package.json` contains:

- `"dev": "tsx watch src/index.tsx"`
- `"start": "tsx src/index.tsx"`
- `"test": "vitest run"`
- The existing `typecheck` script unchanged.

### 7. TypeScript configuration is enabled

`tsconfig.json` contains `"strict": true`, `"jsx": "react-jsx"`, and `"jsxImportSource": "hono/jsx"`.

## Scope Check

There is one route (`GET /`). The page includes a responsive viewport meta tag but no shared layout, CSS, database, or additional features.

## Not Required

- Tests beyond the Phase 1 root-response and route-scope cases.
- CI pipeline.
- Cross-device visual QA; CSS-based responsive layout is added in later phases.

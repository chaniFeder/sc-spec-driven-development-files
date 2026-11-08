# Phase 1 Validation — Hello Hono

## Definition of Done

### 1. TypeScript compiles

Run:

```text
npm run typecheck
```

The command exits with code 0.

### 2. Server starts

Run:

```text
npm run dev
```

The server starts without errors and listens on the development port (default 3000).

### 3. Root route returns the page

Request:

```text
curl -i http://localhost:3000/
```

The response has HTTP status `200 OK`, is HTML, and contains:

- An `<h1>` element with the text `AgentClinic`.
- The exact tagline `Where AI agents come to get better.`
- HTML rendered by the `Home` component from `src/pages/Home.tsx`, called by the `GET /` route in `src/index.tsx`.

### 4. Dependencies are pinned

`package.json` lists `hono` at `4.12.9` and `@hono/node-server` at `1.19.12`, without version-range prefixes.

### 5. Scripts use the TSX entry point

`package.json` contains:

- `"dev": "tsx watch src/index.tsx"`
- `"start": "tsx src/index.tsx"`
- The existing `typecheck` script unchanged.

### 6. TypeScript configuration is enabled

`tsconfig.json` contains `"strict": true`, `"jsx": "react-jsx"`, and `"jsxImportSource": "hono/jsx"`.

## Scope Check

There is one route (`GET /`). No shared layout, CSS, database, or additional features are included.

## Not Required

- Automated tests.
- CI pipeline.
- Browser rendering checks; an HTTP request is sufficient.

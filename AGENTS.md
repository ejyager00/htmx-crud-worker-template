# Cloudflare Workers

STOP. Your knowledge of Cloudflare Workers APIs and limits may be outdated. Always retrieve current documentation before any Workers, KV, R2, D1, Durable Objects, Queues, Vectorize, AI, or Agents SDK task.

## Docs

- https://developers.cloudflare.com/workers/
- MCP: `https://docs.mcp.cloudflare.com/mcp`

For all limits and quotas, retrieve from the product's `/platform/limits/` page. eg. `/workers/platform/limits`

## Commands

| Command | Purpose |
|---------|---------|
| `npx wrangler dev` | Local development |
| `npx wrangler deploy` | Deploy to Cloudflare |
| `npx wrangler types` | Generate TypeScript types |

Run `wrangler types` after changing bindings in wrangler.jsonc.

## Node.js Compatibility

https://developers.cloudflare.com/workers/runtime-apis/nodejs/

## Errors

- **Error 1102** (CPU/Memory exceeded): Retrieve limits from `/workers/platform/limits/`
- **All errors**: https://developers.cloudflare.com/workers/observability/errors/

## Product Docs

Retrieve API references and limits from:
`/kv/` · `/r2/` · `/d1/` · `/durable-objects/` · `/queues/` · `/vectorize/` · `/workers-ai/` · `/agents/`

---

# Template-Specific Notes

## What This Repo Is

A reusable CRUD starter template: **Hono + HTMX + Nunjucks SSR + D1 + KV + auth**.

## Key Constraints

- **No Node.js crypto** — all crypto via `SubtleCrypto` (`crypto.subtle`). See `src/lib/crypto.ts` and `src/lib/jwt.ts`.
- **No Nunjucks runtime compilation** — the Workers V8 isolate blocks `new Function()` / eval (`EvalError: Code generation from strings disallowed`), which Nunjucks uses internally. Templates are precompiled to plain JS functions at build time via `npm run build` (`scripts/precompile-templates.js`). The output is `src/lib/templates-precompiled.ts` — do not edit it manually.
- **No `localStorage`/`sessionStorage`** — session state is server-side only (KV + `httpOnly` cookies).
- **Forms must work without JS** — all POST routes must accept standard `application/x-www-form-urlencoded` form submissions. HTMX is progressive enhancement only.

## Architecture

### Routing (`src/index.ts`)
```
app.route("/auth", authRoutes)   // signup, login, logout, refresh
app.route("/", indexRoutes)      // /, /health
app.all("*", ASSETS.fetch)       // static asset fallback
```

### Auth Flow
1. POST `/auth/signup` or `/auth/login` → issues JWT access token (15 min) + refresh token (7 days) as `httpOnly` cookies
2. `authMiddleware` reads `access_token` cookie → checks KV denylist → verifies JWT → sets `c.set("userId", ...)`
3. POST `/auth/logout` → adds token to KV denylist (TTL = remaining lifetime) → deletes refresh token from KV
4. POST `/auth/refresh` → looks up refresh token in KV → issues new access token

### KV Key Conventions
```
denylist:<access_token>   → "1"          (TTL = remaining JWT lifetime)
refresh:<refresh_token>   → "<userId>"   (TTL = 7 days)
```

### Template System
- Templates in `src/templates/` are precompiled at build time by `scripts/precompile-templates.js`
- The output is `src/lib/templates-precompiled.ts` (auto-generated, committed to repo)
- **Adding a new template**: create the `.njk` file, then run `npm run build` to regenerate the precompiled output
- Call `render("pages/my-page.njk", context)` — the name must match a path under `src/templates/`
- `{% extends %}` and `{% include %}` are resolved through the `PrecompiledStaticLoader` in `render.ts`
- `dev` and `deploy` scripts run `npm run build` automatically

### Auth Middleware Usage
```typescript
import { authMiddleware } from "../middleware/auth";

// Protects any route — sets c.get("userId") if valid
route.get("/protected", authMiddleware, async (c) => {
  const userId = c.get("userId");
});
```

Unauthenticated requests: redirect to `/auth/login` if `Accept: text/html`, else 401 JSON.

## Adding Features

### New page (SSR)
1. `src/templates/pages/my-page.njk` — extend `base.njk`
2. Run `npm run build` to precompile
3. Add route in `src/routes/`

### New D1 table
- Add `migrations/000N_description.sql`
- Run `npm run db:migrate:dev`

### New protected route group
- Create `src/routes/my-resource.ts` as a `new Hono<{ Bindings: Env }>()`
- Apply `authMiddleware` on the routes that need it
- Mount in `src/index.ts`: `app.route("/my-resource", myResourceRoutes)`

### New Zod schema
- Add to `src/schemas/` or a new schema file
- Use `zValidator("form", MySchema, ...)` in the route (note: cast `c as MyContext` in the zValidator callback to access typed `c.env`)

## TypeScript Gotchas

- `zValidator` callbacks receive an untyped `Context` — cast with `const ctx = c as YourContextType` to access `ctx.env`
- After changing bindings in `wrangler.jsonc`, always run `npm run types` to update `worker-configuration.d.ts`
- Test `env` from `cloudflare:test` is typed via `src/__tests__/env.d.ts` (augments `ProvidedEnv`)

## Testing

Tests run inside the actual workerd runtime via `@cloudflare/vitest-pool-workers`. Use `SELF.fetch()` for integration tests and `env.DB` for direct D1 access.

```bash
npm test           # run once
npm run test:watch # watch mode
```

The Turnstile test secret (`1x0000000000000000000000000000000AA`) accepts any token string — use `"test-token"` in tests.

## Progressive Web App (PWA)

### Files

| File | Purpose |
|------|---------|
| `public/manifest.json` | Web App Manifest — app name, icons, display mode, theme color |
| `public/sw.js` | Service worker — caching strategies and offline fallback |
| `public/offline.html` | Standalone offline fallback page (pre-cached at SW install) |
| `public/icons/icon.svg` | Placeholder SVG icon (works in modern browsers) |

These are served automatically by the ASSETS binding — no wrangler.jsonc changes needed.

### Caching Strategy

| Request type | Strategy | Reason |
|---|---|---|
| Static assets (`.js`, `.css`, `.png`, `.svg`, etc.) | Cache-first | Immutable between deploys; safe to serve stale |
| HTML navigation (`request.mode === 'navigate'`) | Network-first → offline fallback | Pages are dynamic and auth-sensitive; must not be stale |
| POST forms, HTMX XHR, API calls | Network-only | Data mutations; caching would be incorrect/dangerous |

### Updating the Cache

Increment `CACHE_VERSION` in `public/sw.js` (e.g. `'v1'` → `'v2'`) when deploying breaking changes to static assets. The `activate` event deletes all caches that don't match the current version.

### Icon Requirements

- `public/icons/icon.svg` — works in Chrome/Firefox for favicon and splash; replace for production
- `public/icons/icon-192.png` — required for Android install prompt
- `public/icons/icon-512.png` — required for maskable icon / splash screen

PNG files are referenced in `manifest.json` but not shipped (placeholder only). Generate them from the SVG or your own artwork before deploying.

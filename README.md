# HTMX CRUD Worker Template

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/ejyager00/htmx-crud-worker-template)

```bash
# Initialize a new project using this template
npm create cloudflare@latest -- --template=ejyager00/htmx-crud-worker-template --agents=false 
```

A production-ready Cloudflare Worker template for building full-stack CRUD applications. Includes authentication, server-side rendering, and a clean architecture you can extend immediately.

## Stack

| Layer | Technology |
|---|---|
| Runtime | Cloudflare Worker (TypeScript) |
| Routing | [Hono](https://hono.dev) |
| Database | Cloudflare D1 (SQLite) |
| Sessions / Token storage | Cloudflare KV |
| Frontend | [HTMX](https://htmx.org) + [Tailwind CSS](https://tailwindcss.com) |
| Templating | [Nunjucks](https://mozilla.github.io/nunjucks/) (SSR, precompiled at build time) |
| Validation | [Zod](https://zod.dev) + [@hono/zod-validator](https://github.com/honojs/middleware/tree/main/packages/zod-validator) |
| Auth | Username/password (PBKDF2 via SubtleCrypto) + JWT in `httpOnly` cookie |
| Bot protection | [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) |
| Testing | [Vitest](https://vitest.dev) + [@cloudflare/vitest-pool-workers](https://developers.cloudflare.com/workers/testing/vitest-integration/) |

## What's Included

### Authentication
- **Sign up** — username/password with Turnstile bot protection
- **Log in** — same flow; issues JWT access token + refresh token as `httpOnly` cookies
- **Log out** — denylists the access token in KV; deletes refresh token
- **Token refresh** — POST `/auth/refresh` issues a new access token from a valid refresh token

All forms work as standard HTML POST submissions (no JavaScript required) and also work with HTMX for enhanced UX.

### Security
- Passwords hashed with PBKDF2-SHA256, 300,000 iterations (SubtleCrypto — no Node.js crypto)
- JWTs signed with HMAC-SHA256 (SubtleCrypto — no `jsonwebtoken`)
- Access token TTL: 15 minutes; Refresh token TTL: 7 days
- No `localStorage`/`sessionStorage` — all session state lives server-side (KV + `httpOnly` cookies)
- KV-backed JWT denylist for immediate logout invalidation

### Templates
Server-rendered Nunjucks templates with a base layout, nav, header, and footer. Templates are precompiled to plain JavaScript functions at build time (`npm run build`) — no runtime code generation, no filesystem access, and no Wrangler text rules required.

### Progressive Web App
- **Web App Manifest** (`/public/manifest.json`) — enables browser install prompts and standalone display mode
- **Service Worker** (`/public/sw.js`) — cache-first for static assets, network-first for HTML (with offline fallback), network-only for POST/API calls
- **Offline page** (`/public/offline.html`) — standalone static page shown when the user is offline; pre-cached at SW install time
- **Placeholder icons** in `/public/icons/` — SVG works in modern browsers; replace with real PNG files for full install prompt support

## Project Structure

```
/
├── wrangler.jsonc
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── .dev.vars.example
├── migrations/
│   └── 0001_initial.sql          # users table
├── src/
│   ├── index.ts                  # Hono app entry point
│   ├── types.ts                  # Env interface
│   ├── schemas/
│   │   └── auth.ts               # Zod schemas (SignupSchema, LoginSchema)
│   ├── middleware/
│   │   ├── auth.ts               # JWT verification middleware
│   │   └── error.ts              # Global error handler
│   ├── routes/
│   │   ├── auth.ts               # /auth/signup, /login, /logout, /refresh
│   │   └── index.ts              # / and /health
│   ├── lib/
│   │   ├── crypto.ts             # PBKDF2 hash/verify
│   │   ├── jwt.ts                # HS256 sign/verify
│   │   ├── turnstile.ts          # Turnstile verification
│   │   └── render.ts             # Nunjucks SSR helper
│   ├── templates/
│   │   ├── base.njk
│   │   ├── partials/
│   │   │   ├── head.njk
│   │   │   ├── nav.njk
│   │   │   ├── header.njk
│   │   │   └── footer.njk
│   │   └── pages/
│   │       ├── signup.njk
│   │       └── login.njk
│   └── __tests__/
│       ├── auth.test.ts
│       └── env.d.ts
└── public/                       # Static assets (served by Worker Assets binding)
```

## Setup

### Prerequisites

- [Node.js](https://nodejs.org) 18+
- A Cloudflare account with Workers access
- Wrangler authenticated: `npx wrangler login`

### 1. Install dependencies

```bash
npm install
```

### 2. Create Cloudflare resources

```bash
# Create the D1 database
npx wrangler d1 create my-app-db

# Create the KV namespace
npx wrangler kv namespace create SESSIONS
```

### 3. Configure `wrangler.jsonc`

Fill in the IDs returned by the commands above. There are three environments to update: the top-level (used as a fallback), `env.dev`, and `env.production`.

```jsonc
// Top-level (fallback)
"d1_databases": [{ "binding": "DB", "database_id": "<YOUR_DB_ID>" }],
"kv_namespaces": [{ "binding": "SESSIONS", "id": "<YOUR_KV_ID>" }],

// env.dev and env.production — each can have separate DB/KV resources
```

After updating, regenerate types:

```bash
npm run types
```

### 4. Configure local secrets

```bash
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars` — the example file includes Cloudflare's always-pass Turnstile test keys, which work without a real Turnstile account during development:

```
JWT_SECRET=changeme_use_a_long_random_string
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
TURNSTILE_SITE_KEY=1x00000000000000000000AA
ENVIRONMENT=dev
```

### 5. Run the database migration

```bash
npm run db:migrate:dev
```

### 6. Start the dev server

```bash
npm run dev
```

Visit `http://localhost:8787`. You'll be redirected to `/auth/login`.

## Scripts

| Script | Command |
|---|---|
| `npm run dev` | Precompile templates, then start local dev server |
| `npm run deploy` | Precompile templates, then deploy to Cloudflare |
| `npm run build` | Precompile Nunjucks templates to JS (run after editing `.njk` files) |
| `npm run types` | Regenerate TypeScript types from `wrangler.jsonc` |
| `npm test` | Run integration tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run db:migrate:dev` | Apply migrations to local D1 |
| `npm run db:migrate:prod` | Apply migrations to remote D1 |

## Deployment

### Set production secrets

```bash
npx wrangler secret put JWT_SECRET --env production
npx wrangler secret put TURNSTILE_SECRET_KEY --env production
```

### Apply the production migration

```bash
npm run db:migrate:prod
```

### Deploy

```bash
npm run deploy
```

## Extending the Template

### Adding a new page

1. Create a template in `src/templates/pages/my-page.njk` (extend `base.njk`)
2. Run `npm run build` to precompile the new template
3. Add a route in `src/routes/` using `render("pages/my-page.njk", context)`

### Adding a protected route

```typescript
import { authMiddleware } from "../middleware/auth";

app.get("/dashboard", authMiddleware, async (c) => {
  const userId = c.get("userId");
  // userId is the authenticated user's ID from D1
  return c.html(render("pages/dashboard.njk", { userId }));
});
```

### Adding a new D1 table

Create a new migration file (increment the number):

```sql
-- migrations/0002_add_posts.sql
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
```

Then apply it:

```bash
npm run db:migrate:dev
```

## Notes

- **Tailwind CDN**: The template uses Tailwind's Play CDN for simplicity. For production, replace it with a PostCSS or Tailwind CLI build step.
- **Nunjucks**: Templates are precompiled to plain JS functions by `scripts/precompile-templates.js`. Nunjucks' `new Function()` code generation is blocked in the Workers runtime — precompiling at build time avoids this entirely. Always use `render()` from `src/lib/render.ts`, and run `npm run build` after adding or editing any `.njk` file.
- **Turnstile**: The `.dev.vars.example` file includes Cloudflare's always-pass test keys. Create a real site/secret key pair at [dash.cloudflare.com](https://dash.cloudflare.com) for production.
- **PWA icons**: The template ships a placeholder SVG icon. For browser install prompts, generate real PNG icons at 192×192 and 512×512 pixels and place them at `public/icons/icon-192.png` and `public/icons/icon-512.png`. Update `name` and `short_name` in `public/manifest.json` when you clone the template.
- **PWA cache version**: When deploying breaking changes to static assets, increment `CACHE_VERSION` in `public/sw.js` (e.g. `'v1'` → `'v2'`). The activate event will automatically purge the old cache.

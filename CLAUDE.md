# CLAUDE.md

This file provides guidance to Claude Code when working with the MIA repository.

## Project Overview

**MIA (Mujeres en Industrias de Animación)** is a professional association web app for women
in the animation industry in Spain. It handles member registration, membership management,
a public member gallery, and a member portal.

**All user-facing text MUST be in Spanish.** Code, comments, variable names, and commits stay in English.

---

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite 7
- **Styling:** Tailwind CSS 4 + Radix UI (shadcn/ui pattern)
- **Routing:** React Router 7
- **Forms:** react-hook-form + Zod (schemas in `src/schemas/`)
- **Data fetching:** TanStack React Query v5 — all API calls, never raw useEffect+fetch
- **State:** Zustand (`src/store/`) + React Context for toasts/loading
- **Hosting:** Cloudflare Pages
- **Functions:** Cloudflare Workers via Pages Functions (`functions/`)
- **Database:** Cloudflare D1 (SQLite) — member gallery cache
- **Storage:** Cloudflare R2 — member profile photos
- **Token cache:** Cloudflare KV — WildApricot OAuth token
- **Bot protection:** Cloudflare Turnstile — all public forms
- **Membership CRM:** WildApricot REST API v2.2
- **Payments:** Stripe Checkout Sessions (current) → WildApricot native gateway (planned)
- **Membership emails:** WildApricot native (welcome, renewal, expiry)
- **Node.js:** 24.x (Active LTS) — required, see `.nvmrc`

## What We Are NOT Using
- ~~Supabase~~ — replaced by Cloudflare D1. Supabase MCP is kept as **read-only** for migrating existing photo URLs to R2. Do not write to Supabase or add new Supabase dependencies.
- ~~Express/Node server~~ — Cloudflare Workers only
- ~~reCAPTCHA~~ — Cloudflare Turnstile only
- ~~Discount codes in app code~~ — managed in WildApricot admin dashboard

---

## Path Aliases
```typescript
@/*           → /src/*
@/components  → /src/components
@/pages       → /src/pages
@/hooks       → /src/hooks
@/contexts    → /src/contexts
@/utils       → /src/utils
@/types       → /src/types
@/assets      → /src/assets
```

Always use these aliases when importing from these directories.

---

## Directory Structure
```
src/
├── components/
│   ├── ui/              # Radix UI primitives (shadcn/ui pattern)
│   ├── cards/           # Card components
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── Layout.tsx
├── pages/
│   ├── socias/          # SociasPage sub-components (gallery — primary missing feature)
│   └── *.tsx
├── contexts/            # ToastContext, LoadingContext
├── hooks/               # useToast, useLoading, custom hooks
├── types/               # TypeScript interfaces — extend, don't duplicate
│   ├── index.ts         # Member, FilterState, ANIMATION_SPECIALIZATIONS
│   ├── member.ts        # BoardMember, Fundadora, MemberStats
│   └── api.ts           # API request/response types
├── config/
│   └── site.config.ts   # Env-aware config: Stripe links, Turnstile key, analytics
├── schemas/
│   └── registrationSchema.ts  # Zod schemas (remove VALID_DISCOUNT_CODES — see TODOs)
├── store/               # Zustand stores
├── data/                # Static data: directiva.ts, fundadoras.ts
└── utils/

functions/               # Cloudflare Pages Functions
├── _lib/                # Shared utilities (token helper, turnstile helper)
└── api/
    ├── contact.ts       # POST — Turnstile verify → email notification (working)
    ├── members.ts       # GET  — gallery data from D1 (to build)
    ├── member-sync.ts   # POST — WA webhook → D1 upsert (to build)
    └── upload-photo.ts  # POST — image → R2 (to build)

migrations/              # D1 SQL migrations
.claude/
└── agents/              # Sub-agent definitions
```

---

## Cloudflare Bindings (wrangler.toml)

Current state has only Turnstile and Stripe keys. Missing bindings to add:
```toml
[[d1_databases]]
binding = "DB"
database_name = "mia-members"
database_id = "FILL_AFTER_wrangler_d1_create"

[[r2_buckets]]
binding = "PHOTOS"
bucket_name = "mia-photos"

[[kv_namespaces]]
binding = "KV"
id = "FILL_AFTER_wrangler_kv_create"
```

Secrets managed via `wrangler secret put` (never in wrangler.toml):
```
WILDAPRICOT_API_KEY
TURNSTILE_SECRET_KEY
```

---

## D1 Schema
```sql
-- migrations/0001_members.sql
CREATE TABLE IF NOT EXISTS members (
  id              TEXT PRIMARY KEY,    -- WildApricot Contact.Id
  nombre          TEXT NOT NULL,
  email           TEXT,
  foto_url        TEXT,
  bio             TEXT,
  categorias      TEXT,                -- JSON array
  pais            TEXT,
  ciudad          TEXT,
  redes           TEXT,                -- JSON object
  nivel           TEXT,                -- WA membership level
  status          TEXT DEFAULT 'Active',
  mostrar_galeria INTEGER DEFAULT 1,
  updated_at      TEXT
);
CREATE INDEX IF NOT EXISTS idx_status  ON members(status);
CREATE INDEX IF NOT EXISTS idx_mostrar ON members(mostrar_galeria);
```

---

## WildApricot API

- Base URL: `https://api.wildapricot.org/v2.2`
- Auth: `POST https://oauth.wildapricot.org/auth/token` (client_credentials)
- Token TTL: 1800s — cache in KV `wa_token` with `expirationTtl: 1740`
- **CORS:** All WA calls MUST be in `functions/` — never in `src/`
- Rate limit: ~30 req/min — max 1 req/sec, backoff on timeout (5s/10s/20s, 3 retries)
- Custom field codes: `custom-XXXXXXX` — discover via `GET /accounts/{id}/contactfields`

---

## Registration Flow (Current — Working, Do Not Break)

1. User selects membership on `/registro`
2. Accepts TOS + GDPR
3. POSTs to `/api/create-checkout-session` with `{ membershipType }`
4. Worker returns `{ url }` — frontend redirects to Stripe-hosted checkout
5. Stripe handles payment and redirects to `/registro/exito`
6. **No post-payment WA sync yet** — to be added

**Discount codes:** Managed in WildApricot admin dashboard — NOT in app code. Do not add discount code UI or logic to RegistrationPage.

---

## Development Commands
```bash
npm run dev          # Vite dev server (port 3000)
npm run build        # tsc --noEmit && vite build
npm run lint         # ESLint
npm test             # Vitest
npx wrangler dev     # Test Cloudflare Functions locally
```

---

## CI / CD

- **CI:** GitHub Actions — runs on all PRs to `main`/`dev` and pushes to `dev`
  - Steps: audit → lint → build → test (all must pass before merge)
  - Security: dependency-review blocks PRs introducing high/critical CVEs
  - See `.github/workflows/ci.yml` and `.github/workflows/security.yml`
- **CD:** Cloudflare Pages Git integration (not GitHub Actions)
  - Push to `dev` → auto-deploys to `dev.animacionesmia.com`
  - Push to `main` → auto-deploys to `animacionesmia.com`
  - PRs → preview URL auto-generated by Cloudflare
- **Releases:** Release Please — triggered on merge to `main` (stable) or `dev` (prerelease)
  - Opens a release PR automatically after conventional commits land
  - Merge the release PR to cut a version and update CHANGELOG.md
  - Versions: `main` → `1.0.0`, `dev` → `1.0.0-dev.0`
  - See `.github/workflows/release-please.yml`

---

## Research & Documentation Rules

Before using any library, SDK, API, or tool:

1. **Always use Context7 MCP** to pull current documentation for any library in use. Never rely on training knowledge for API signatures, config options, or version-specific behavior.
2. **Always use web search** to verify the current stable version of any software before installing or referencing it. Check the official source (npm, GitHub releases, official docs).
3. This applies to: npm packages, Cloudflare APIs, WildApricot API, Stripe, Vite plugins, Tailwind config, shadcn/ui, React Router, TanStack Query, Wrangler CLI, and any new integration.

---

## Logging (Workers Logs)

Workers Logs is enabled in `wrangler.toml` (`[observability] enabled = true`) for both production and preview environments.

**Rules for Pages Functions (`functions/`):**
- Never use raw `console.log/warn/error` strings — always use the shared logger at `functions/_lib/logger.ts`
- Import: `import { log, warn, logError } from '../_lib/logger';` (adjust relative path)
- Emit **objects**, not strings — Workers Logs indexes JSON fields for dashboard filtering:
  ```typescript
  log('event.name', { email, contactId, membershipType });   // info
  warn('event.name', { email, reason });                      // warning
  logError('event.name', err, { email, step: 'wa_lookup' }); // error — extracts err.message
  ```
- Event names use `domain.action` format: `auth.session_created`, `portal.error`, `wa.contact_updated`, etc.
- Include identifying fields where available: `email`, `contactId`, `membershipType`, `step`
- Never log secrets, tokens, or full request bodies

When adding a new Pages Function, always add structured log calls for success paths and error paths.

---

## Coding Conventions

- TypeScript strict mode — all new code must pass `npm run build`
- Functional components with hooks only
- Keep components under 200 lines — extract sub-components if needed
- `cn()` from `@/lib/utils` for className merging
- No inline styles
- Error boundaries on all async views
- Never log secrets or expose API keys in client-side code
- Use existing types from `src/types/` — extend, never duplicate

---

## Git Workflow

See `.claude/agents/git-workflow.md` for full branching, commit, PR, and merge rules.

**Quick reference:**
- Branch from `dev`, not `main`
- Commits: conventional format `type(scope): description` — **lowercase, never capitalize the description, never omit the scope**
- PRs always target `dev`
- `main` only receives merges from `dev` via PR — never direct commits
- Release Please reads commit messages to bump versions — wrong type = wrong version bump (`feat` = minor, `fix` = patch, `chore` = no bump)

---

## Sub-Agents

| Agent | Use for |
|-------|---------|
| `wildapricot-api` | WA API calls, token management, D1 sync, webhooks |
| `member-gallery` | SociasPage, /api/members, D1 queries, gallery UI |
| `cloudflare-infra` | wrangler.toml, D1 migrations, R2, KV, deployments |
| `registration-flow` | RegistrationPage, Zod schemas, payment redirect |
| `frontend` | React components, Tailwind styling, React Query, animations, PWA |
| `git-workflow` | Branching strategy, commits, PRs, merges |

---

## Known Issues / TODOs

- `SociasPage.tsx` — "Próximamente" placeholder, needs full gallery implementation
- `directiva.ts` — photo URLs point to Supabase Storage, migrate to R2 before go-live
- `registrationSchema.ts` — remove `VALID_DISCOUNT_CODES` and `calculateDiscountedPrice`
- Member stats in `HomePage` — manually updated (see TODO comment)
- D1, R2, KV bindings not yet in `wrangler.toml`
- No WildApricot integration yet — not started
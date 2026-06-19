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
- **State:** React Context for toasts/loading + local component state. (No Zustand — see "What We Are NOT Using".)
- **Hosting:** Cloudflare Pages
- **Functions:** Cloudflare Workers via Pages Functions (`functions/`)
- **Database:** Cloudflare D1 (SQLite) — member-code allocator only (`mia-member-codes`). **Not** the gallery store.
- **Caching:** Cloudflare KV — WildApricot OAuth token (`wa_token`), gallery JSON (`gallery_members`, 1h TTL), portal sessions (`session:*`)
- **Member photos:** served as WildApricot photo URLs (gallery) and static `/public/images/*` (directiva, fundadoras). R2 is **planned** for member-uploaded photos but not yet wired.
- **Bot protection:** Cloudflare Turnstile — all public forms
- **Membership CRM:** WildApricot REST API v2.2
- **Payments:** Stripe Checkout Sessions (current) → WildApricot native gateway (planned)
- **Membership emails:** Resend (transactional) + WildApricot native (welcome, renewal, expiry)
- **Node.js:** 24.x (Active LTS) — required, see `.nvmrc`

## What We Are NOT Using
- ~~Supabase~~ — fully removed (no dependency, no MCP writes). Photo URLs already migrated to static `/public/images/*`.
- ~~Zustand~~ — installed previously but no stores were ever created; removed. Use React Context + React Query.
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
│   ├── socias/          # SociasPage sub-components (member gallery — built)
│   ├── portal/          # Member portal pages
│   └── *.tsx
├── contexts/            # ToastContext, LoadingContext
├── hooks/               # useToast, useLoading, usePortalAuth, useMemberFilters, etc.
├── types/               # TypeScript interfaces — extend, don't duplicate
│   ├── index.ts         # MembershipType, ANIMATION_SPECIALIZATIONS, FormData
│   ├── member.ts        # Member (gallery), BoardMember, Fundadora, MemberStats
│   └── api.ts           # API request/response types
├── config/
│   └── site.config.ts   # Env-aware config: Stripe links, Turnstile key, analytics
├── schemas/
│   ├── registrationSchema.ts  # Zod registration schemas (step-based)
│   └── portalSchema.ts        # Zod portal profile schema
├── data/                # Static data: directiva.ts, fundadoras.ts
└── utils/

functions/               # Cloudflare Pages Functions
├── _lib/                # Shared utils: logger, wa-token, wa-contacts, email, cors, session, member-code
└── api/
    ├── contact.ts                 # POST — Turnstile verify → Resend email (working)
    ├── create-checkout-session.ts # POST — create Stripe Checkout Session (working)
    ├── checkout-session.ts        # GET  — Stripe session status lookup (working)
    ├── stripe-webhook.ts          # POST — Stripe webhook (signature-verified) (working)
    ├── members.ts                 # GET  — gallery: live WildApricot fetch, cached in KV 1h (working)
    ├── auth/                      # Magic-link auth: request-link, verify, me, logout
    └── portal/                    # Member portal: profile (GET/PUT), customer-portal, _middleware

migrations/              # D1 SQL migrations (member-code allocator)
.claude/
└── agents/              # Sub-agent definitions
```

---

## Cloudflare Bindings (wrangler.toml)

All required bindings are configured (production + `env.preview`):
- **KV** (`binding = "KV"`) — WA token, gallery cache, portal sessions
- **D1** (`binding = "DB"`, `mia-member-codes` / `mia-member-codes-dev`) — member-code allocator
- Stripe price IDs, WildApricot account/level IDs, Turnstile sitekey, Resend config as `[vars]`

> R2 is **not** bound yet. Add a `[[r2_buckets]]` block only when implementing member photo upload (see TODOs).

Secrets managed via `wrangler secret put` (never in wrangler.toml):
```
WILDAPRICOT_API_KEY        STRIPE_SECRET_KEY
TURNSTILE_SECRET_KEY       STRIPE_WEBHOOK_SECRET
RESEND_API_KEY
```

---

## Data Stores

**Gallery** is **not** stored in D1. `GET /api/members` fetches contacts live from WildApricot
(async paginated), transforms them, and caches the JSON in KV under `gallery_members` for 1h
(`CACHE_TTL = 3600`). The frontend mirrors this with React Query `staleTime: 1h`. This is
intentional (KISS) — at the current member count, live-fetch-on-cache-miss stays well within
WA's ~30 req/min limit. Do not reintroduce a D1 `members` table or a `member-sync` webhook
unless scale or WA-downtime resilience demands it.

**D1** holds only the member-code allocator (`migrations/0001_member_codes.sql`,
`0002_member_code_assignments_by_contact.sql`) used during Stripe registration.

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
6. `stripe-webhook.ts` (signature-verified) handles `checkout.session.completed` → allocate member code + create/update WildApricot contact, and `customer.subscription.deleted` → lapse WA membership

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
4. **Always use the latest stable version** of any library, SDK, API, or tool. Do not use beta, alpha, or release candidate versions unless explicitly approved by the user.
5. **Always use KISS (Keep It Simple, Stupid)** principle when implementing any feature. Do not over-engineer or add unnecessary complexity.
6. **Always use YAGNI (You Ain't Gonna Need This)** principle when implementing any feature. Do not add features that are not required for the current implementation.
7. **Always use DRY (Don't Repeat Yourself)** principle when implementing any feature. Do not repeat code or logic.
8. **Test the critical paths.** Payments, auth, Zod schemas, and member-code allocation must have tests; any new money- or auth-related code requires tests before merge. Prefer test-first where practical. (We do not require full TDD coverage on presentational UI.)
9. **Always use SOLID** principles when implementing any feature. Do not over-engineer or add unnecessary complexity.
10. **Always use Clean Architecture** (Separation of Concerns, Dependency Rule, Testability) when implementing any feature. Do not over-engineer or add unnecessary complexity.
11. **Open Source is your friend.** Don't build everything from scratch — find stable, trusted libraries.

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
- Keep components under 300 lines — extract sub-components if needed
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
- **One branch = one PR** — delete the local branch after merge; GitHub auto-deletes the remote
- Commits: conventional format `type(scope): description` — **lowercase, never capitalize the description, never omit the scope**
- PRs always target `dev`
- To sync with dev mid-flight: `git rebase origin/dev` — **never** `git merge dev`
- `main` only receives merges from `dev` via PR — never direct commits
- Release Please reads commit messages to bump versions — wrong type = wrong version bump (`feat` = minor, `fix` = patch, `chore` = no bump)

---

## Sub-Agents

| Agent | Use for |
|-------|---------|
| `wildapricot-api` | WA API calls, token management, Stripe→WA contact sync, webhooks |
| `member-gallery` | SociasPage, /api/members, KV gallery cache, gallery UI |
| `cloudflare-infra` | wrangler.toml, D1 migrations, R2, KV, deployments |
| `registration-flow` | RegistrationPage, Zod schemas, payment redirect |
| `frontend` | React components, Tailwind styling, React Query, animations, PWA |
| `git-workflow` | Branching strategy, commits, PRs, merges |

---

## Known Issues / TODOs

- `portal/PhotoCard.tsx` — photo upload is a "Próximamente" stub; needs R2 bucket + `upload-photo` function
- Member stats in `HomePage` (`MEMBER_STATS`) — hardcoded. Needs a product decision on what "active/total members" means (WA total vs gallery-visible count) before wiring to a live source.
- `HomePage` "85% growth" / "50 events" counters — static marketing numbers, no source
- Token/color system — brand red is defined as `--color-primary` but components hardcode `bg-red-600` (a different red), and a third value lives in the shadcn HSL tokens. Consolidate to a single Tailwind `@theme` source of truth.
- `--color-text-secondary` (#747474) on white is ~4.48:1 — below WCAG AA (4.5:1); darken slightly.

**Resolved (kept for history):** Supabase removed · D1/KV bindings configured · `VALID_DISCOUNT_CODES` removed · directiva/fundadoras photos migrated to `/public/images` · gallery built (KV-cached, not D1).
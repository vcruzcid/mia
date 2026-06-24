# CLAUDE.md

This file provides guidance to Claude Code when working with the MIA repository.

## Project Overview

**MIA (Mujeres en Industrias de Animación)** is a professional association web app for women
in the animation industry in Spain. It is a marketing site plus a public member gallery
(read from WildApricot). Signup, payments, member login and emails are delegated to the
WildApricot-hosted site (`web.animacionesmia.com`).

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
- **Caching:** Cloudflare KV — WildApricot OAuth token (`wa_token`) + gallery JSON (`gallery_members`, 24h TTL)
- **Member photos:** WildApricot profile-picture URLs (gallery) and static `/public/images/*` (directiva, fundadoras).
- **Membership CRM:** WildApricot REST API v2.2 (read-only, for the gallery)
- **Signup / payments / member login / emails:** all handled on the **WildApricot-hosted site** (`web.animacionesmia.com`). The React app links out to it; it does not run these flows itself.
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
│   ├── socias/          # SociasPage sub-components (member gallery)
│   └── *.tsx
├── contexts/            # ToastContext, LoadingContext
├── hooks/               # useToast, useLoading, useMemberFilters, etc.
├── types/               # TypeScript interfaces — extend, don't duplicate
│   ├── index.ts         # MembershipType, ANIMATION_SPECIALIZATIONS
│   ├── member.ts        # Member (gallery), BoardMember, Fundadora, MemberStats
│   └── api.ts           # ApiResponse
├── config/
│   └── site.config.ts   # Env-aware config: WildApricot URLs, analytics
├── data/                # Static data: directiva.ts, fundadoras.ts
└── utils/

functions/               # Cloudflare Pages Functions (gallery only)
├── _lib/                # Shared utils: logger, wa-token, wa-field-ids, cors
└── api/
    └── members.ts       # GET — gallery: WildApricot async fetch, cached in KV 24h

.claude/
└── agents/              # Sub-agent definitions
```

---

## Cloudflare Bindings (wrangler.toml)

Configured (production + `env.preview`):
- **KV** (`binding = "KV"`) — WA OAuth token + gallery cache
- WildApricot account/level IDs as `[vars]`

Secrets managed via `wrangler secret put` (never in wrangler.toml):
```
WILDAPRICOT_API_KEY   (read-only WildApricot access for the gallery)
```

---

## Data Stores

`GET /api/members` fetches active contacts from WildApricot via the **async** Contacts API
(filter `'Membership status' eq 'Active'`, paged with `$skip` because async results cap at 100),
transforms them, and caches the JSON in KV under `gallery_members` for 24h (`CACHE_TTL = 86400`).
The frontend mirrors this with React Query `staleTime: 24h` and renders with infinite scroll.
There is no app database — WildApricot is the source of truth.

---

## WildApricot API

- Base URL: `https://api.wildapricot.org/v2.2`
- Auth: `POST https://oauth.wildapricot.org/auth/token` (client_credentials)
- Token TTL: 1800s — cache in KV `wa_token` with `expirationTtl: 1740`
- **CORS:** All WA calls MUST be in `functions/` — never in `src/`
- Rate limit: ~30 req/min — max 1 req/sec, backoff on timeout (5s/10s/20s, 3 retries)
- Custom field codes: `custom-XXXXXXX` — discover via `GET /accounts/{id}/contactfields`

---

## Signup / login / contact (delegated to WildApricot)

The React app does **not** run signup, payment, auth, or email flows. It links out to the
WildApricot-hosted site (URLs in `src/config/site.config.ts` → `wildApricot`):
- **Signup / "Únete a MIA"** → `https://web.animacionesmia.com/membresia`
- **Member login / "Acceso socias"** → `https://web.animacionesmia.com/Sys/Login`
- **Contact form** → `https://web.animacionesmia.com/contacto`

All such links are external (`<a target="_blank" rel="noopener noreferrer">`), not React Router
`<Link>`. WildApricot handles payments, the member portal, and welcome/renewal emails natively.

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
| `wildapricot-api` | WA API calls, token management (read-only gallery fetch) |
| `member-gallery` | SociasPage, /api/members, KV gallery cache, gallery UI |
| `cloudflare-infra` | wrangler.toml, KV, deployments |
| `frontend` | React components, Tailwind styling, React Query, animations, PWA |
| `git-workflow` | Branching strategy, commits, PRs, merges |

---

## Known Issues / TODOs

- **Member photos** — the gallery reads WildApricot profile pictures (`ProfileImage.Url`); pending the Supabase→WildApricot photo import. Verify those URLs are publicly loadable by an `<img>` once added.
- Member stats in `HomePage` (`MEMBER_STATS`) — hardcoded. Needs a product decision on what "active/total members" means (WA total vs gallery-visible count) before wiring to a live source.
- `HomePage` "85% growth" / "50 events" counters — static marketing numbers, no source
- Token/color system — brand red is defined as `--color-primary` but components hardcode `bg-red-600` (a different red), and a third value lives in the shadcn HSL tokens. Consolidate to a single Tailwind `@theme` source of truth.
- `--color-text-secondary` (#747474) on white is ~4.48:1 — below WCAG AA (4.5:1); darken slightly.

**Resolved (kept for history):** Supabase removed · gallery built (KV-cached) with infinite scroll · email/auth/portal/Stripe/D1/Turnstile/Resend removed — signup, payments, login and emails delegated to the WildApricot-hosted site.
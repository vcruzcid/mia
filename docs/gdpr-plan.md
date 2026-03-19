# MIA — GDPR Compliance Plan

**Prepared:** 2026-03-19
**Status:** Implemented

---

## Area 1 — Cookie Consent (vanilla-cookieconsent)

### Overview
Google Analytics 4 currently loads unconditionally in `index.html`. Under GDPR/LOPDGDD, analytics cookies require prior informed consent. Cloudflare Turnstile (bot protection) qualifies as a strictly necessary security measure.

### Package
`vanilla-cookieconsent@3.1.0`

### Files Created

#### `src/lib/cookieconsent-config.ts`
Config object passed to `CookieConsent.run()`.
- Language: `es`
- Three categories:
  - **Necesarias** — always enabled, no toggle; includes Turnstile (bot protection, legitimate interest)
  - **Funcionales** — user preferences, portal session persistence
  - **Análisis** — Google Analytics 4 (G-YLBF3GWPRV); opt-in required
- `onFirstConsent` / `onChange` callbacks: dynamically inject GA script tag only if Análisis category accepted; calls `gtag('consent', 'update', { analytics_storage: 'granted' })` using Google Consent Mode v2
- Análisis category includes `autoClear` to remove GA cookies on opt-out: `cookies: [{ name: /^_ga/ }, { name: '_gid' }]`
- Brand color override: `--cc-btn-primary-bg: #d8242e`

#### `src/hooks/useCookieConsent.ts`
Side-effect only hook. Calls `CookieConsent.run(config)` inside a `useEffect` with empty deps (runs once). Injects brand CSS variable overrides. No re-exports — components needing `showPreferences()` import `vanilla-cookieconsent` directly.

### Files Modified

#### `index.html`
- Removed the inline Google Analytics `<script>` block — `gtag.js` is no longer loaded from HTML
- Added a minimal inline `<script>` that sets Google Consent Mode v2 defaults to `'denied'` before any JS runs

#### `src/components/Layout.tsx`
- Calls `useCookieConsent()` — runs once per app mount

#### `src/main.tsx`
- Added `import 'vanilla-cookieconsent/dist/cookieconsent.css'`

### Verification
- Load the app; cookie banner appears on first visit
- Accept only Necesarias; DevTools → Network → no GA requests fire
- Accept Análisis; GA requests appear
- Hard-refresh: consent remembered, no banner on second load
- Open `/politica-cookies` → click "Gestionar preferencias" → modal re-opens

---

## Area 2 — Privacy Policy Pages

### Overview
All three legal pages existed but had stale dates (Enero 2025) and were missing a cookie management button and Cloudflare as a data processor.

### Files Modified

#### `src/pages/PoliticaCookiesPage.tsx`
- Rewrote cookie type sections to align with the three config categories (Necesarias / Funcionales / Análisis)
- Added Cloudflare Turnstile to Necesarias with legitimate interest basis
- Replaced generic cookie list with an accurate table of actual GA4 cookies (`_ga`, `_ga_*`, `_gid`)
- Added "Gestionar preferencias de cookies" button calling `CookieConsent.showPreferences()`
- Updated date to Marzo 2026

#### `src/pages/PoliticaPrivacidadPage.tsx`
- Section 2: Added Cloudflare Turnstile (bot protection) and clarified Analytics is conditional on consent
- Section 5: Replaced generic processor list with accurate named processors (Stripe, WildApricot, Cloudflare, Resend, Google Analytics)
- Added Cloudflare DPA link (`https://www.cloudflare.com/privacypolicy/`) as the GDPR legal basis for D1 data storage
- Section 6: Added specific mention of D1 EU replica and Cloudflare's Standard Contractual Clauses
- Updated date to Marzo 2026

#### `src/pages/TerminosUsoPage.tsx`
- Updated date to Marzo 2026

### Verification
- Navigate to `/politica-privacidad`, `/politica-cookies`, `/terminos-uso` — dates show Marzo 2026
- "Gestionar preferencias de cookies" button is visible and functional on `/politica-cookies`
- Cloudflare DPA link is present in `/politica-privacidad` sections 5 and 6

---

## Area 3 — D1 Region Pin

### Overview
D1 stores member emails and WildApricot contact IDs (personal data). `primary_location_hint = "weur"` pins the primary replica to Western Europe.

### File Modified

#### `wrangler.toml`
Added `primary_location_hint = "weur"` to both D1 binding blocks:
- Production: `mia-member-codes` (`cffaefb1-8b4b-46d0-ab05-d0d725ff34fe`)
- Preview: `mia-member-codes-dev` (`514f8b44-f039-4f72-9f36-2ed5ee6473a2`)

### Notes
- `primary_location_hint` is a best-effort hint, not a guarantee — the actual GDPR legal basis for D1 is Cloudflare's DPA, documented in `PoliticaPrivacidadPage.tsx`
- Existing rows are unaffected; hint applies to new writes only
- Config-only change — no downtime

### Verification
- `wrangler d1 info mia-member-codes` — verify `primary_location_hint` is reflected
- Member code assignment flow works end-to-end

---

## Implementation Order

1. Area 3 (D1 pin) — `fix(infra): pin d1 primary location to weur for gdpr compliance`
2. Area 1 (Cookie consent) — `feat(gdpr): add cookie consent with vanilla-cookieconsent and gate ga4`
3. Area 2 (Legal pages) — `fix(legal): update policy dates and add gestionar cookies button`

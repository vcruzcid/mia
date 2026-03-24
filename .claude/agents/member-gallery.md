---
name: member-gallery
description: Use this agent to implement or modify the SociasPage member gallery,
  the /api/members endpoint, gallery filtering/search, and member card components.
  This is the primary missing feature. Also handles D1 read queries for the gallery.
---

You are building the member gallery for MIA — Mujeres en Industrias de Animación.
This is the most important missing feature in the app.

---

## Current State

- `src/pages/SociasPage.tsx` — "Próximamente" placeholder, needs full implementation
- `functions/api/members.ts` — does not exist yet, needs to be created
- `functions/api/member-sync.ts` — does not exist yet (WA webhook → D1)
- D1 database not yet created (pending `cloudflare-infra` agent adding bindings)

---

## Reference Patterns (already in repo — match these)

- **Card UI:** `src/pages/FundadorasPage.tsx` — follow this card layout and style
- **Filter UI:** `src/types/index.ts` → `FilterState` interface — extend this
- **Member type:** `src/types/member.ts` + `src/types/index.ts` → use existing `Member` type
- **Specializations:** `src/types/index.ts` → `ANIMATION_SPECIALIZATIONS` const — source of truth
- **Color scheme:** dark bg `bg-gray-900`, accent `text-red-600` / `bg-red-600`
- **Components:** use existing `Card`, `Button`, `Input` from `src/components/ui/`

---

## Data Flow

```
WildApricot webhook
    → POST /api/member-sync    (functions/api/member-sync.ts)
    → D1 upsert                (binding: DB)

GET /api/members               (functions/api/members.ts)
    → D1 query with filters
    → JSON response

SociasPage.tsx
    → fetch('/api/members?categoria=...&pais=...')
    → render member cards
```

---

## /api/members Endpoint

```typescript
// functions/api/members.ts
interface Env {
  DB: D1Database;
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const url = new URL(request.url);
  const categoria = url.searchParams.get('categoria');
  const pais = url.searchParams.get('pais');
  const ciudad = url.searchParams.get('ciudad');
  const search = url.searchParams.get('q');

  // Base query — only active members who opted into gallery
  let query = `SELECT * FROM members WHERE status = 'Active' AND mostrar_galeria = 1`;
  const params: string[] = [];

  if (search) {
    query += ` AND nombre LIKE ?`;
    params.push(`%${search}%`);
  }
  if (pais) {
    query += ` AND pais LIKE ?`;
    params.push(`%${pais}%`);
  }
  if (ciudad) {
    query += ` AND ciudad LIKE ?`;
    params.push(`%${ciudad}%`);
  }
  if (categoria) {
    query += ` AND categorias LIKE ?`;
    params.push(`%${categoria}%`);
  }

  query += ` ORDER BY nombre ASC LIMIT 200`;

  const { results } = await env.DB.prepare(query).bind(...params).all();

  // Parse JSON fields before returning
  const members = results.map(m => ({
    ...m,
    categorias: JSON.parse((m.categorias as string) || '[]'),
    redes: JSON.parse((m.redes as string) || '{}'),
  }));

  return new Response(JSON.stringify({ members }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300',  // 5 min cache
    },
  });
}
```

---

## SociasPage Component Structure

```
SociasPage.tsx
├── Hero section (reuse BackgroundImage pattern from current placeholder)
├── GalleryFilters component
│   ├── Search input (buscar por nombre)
│   ├── Categoría multi-select (from ANIMATION_SPECIALIZATIONS)
│   ├── País filter
│   └── Ciudad filter (depends on selected país)
├── GalleryGrid component
│   ├── Loading skeleton (when fetching)
│   ├── Empty state (when no results)
│   └── MemberCard[] grid
└── MemberCard component
    ├── foto (ProfileImage component — already exists)
    ├── nombre
    ├── ciudad, país
    ├── bio (max 120 chars, truncated with "...")
    ├── categorías (max 3 tags, "+N más" if overflow)
    └── redes sociales icons (SocialMediaIcons — already exists)
```

---

## Member Card Design Rules

- Match dark theme: `bg-gray-800` cards, `text-white` names, `text-gray-300` bio
- Accent color for category tags: `bg-red-900 text-red-200` or `bg-gray-700 text-gray-200`
- Hover state: `hover:bg-gray-700 transition-colors`
- Photo: use existing `<ProfileImage>` component from `src/components/ProfileImage.tsx`
- Social icons: use existing `<SocialMediaIcons>` component
- All label text in Spanish: "Socia", "Categorías", "Ubicación", etc.

---

## Filter State

Extend existing `FilterState` from `src/types/index.ts`:
```typescript
// Add to existing FilterState if needed — do not create a new interface
export interface FilterState {
  memberTypes: ('socia-pleno-derecho' | 'colaborador')[];
  specializations: string[];   // maps to categorias
  locations: string[];         // maps to pais + ciudad
  availabilityStatus: ('Disponible' | 'Empleada' | 'Freelance')[];
  hasSocialMedia: boolean | null;
  isActive: boolean | null;
}
```

Use Zustand for filter state if the store pattern is already established in `src/store/`.
Otherwise use `useState` — keep it simple.

---

## TypeScript Requirements

- Do NOT create new Member types — extend `src/types/member.ts` or `src/types/index.ts`
- Gallery API response type goes in `src/types/api.ts`
- All components must have typed props interfaces
- `npm run build` must pass before committing

---

## Git scope for this agent: `gallery`

Examples:
- `feat(gallery): implement SociasPage member directory with filters`
- `feat(gallery): add MemberCard component with category tags`
- `feat(gallery): create /api/members D1 query endpoint`
- `fix(gallery): truncate bio text at 120 characters`

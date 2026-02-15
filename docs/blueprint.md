# MIA React App Audit

## Existing Pages (`src/pages`)
- `HomePage.tsx`: landing content with hero, CTA to membership and registration.
- `AboutPage.tsx`: misión/visión, CTA hacia registro y talleres.
- `MembershipPage.tsx`: detalles de membresía, planes, beneficios y CTA checkout.
- `MianimaPage.tsx`: información de programa Miánima con galería y FAQs.
- `SociasPage.tsx`: listado de socias con filtros y datos básicos.
- `DirectivaPage.tsx`: directiva actual con soporte para años anteriores vía API.
- `SimpleRegistrationPage.tsx`: formulario de registro abreviado (hook form + zod schema).
- `EnhancedPortalPage.tsx` y `PortalPage.tsx`: portal de miembros con enlaces a Stripe y recursos.
- `LoginPage.tsx`: autenticación con Supabase magic link.
- `WelcomePage.tsx`: pantalla posterior a registro.
- `ContactPage.tsx`, `PoliticaPrivacidadPage.tsx`, `PoliticaCookiesPage.tsx`, `TerminosUsoPage.tsx`: páginas informativas y formulario de contacto.

## Shared Components (`src/components`)
- Layout: `Header`, `Footer`, `Layout`, `ErrorBoundary`, `ProtectedRoute`.
- UI primitives (`src/components/ui`): botón, tarjeta, diálogo, tabs, etc. implementados con Radix + Tailwind.
- Utilities: `VimeoVideo`, `ProfileImage`, social icons.

## Context & Hooks
- `AuthContext`, `useAuth`: sesión Supabase y rutas protegidas.
- `ToastContext`, `useToast`: notificaciones globales.
- `LoadingContext`: estado de carga.
- Hooks de animación (`useCounterAnimation`, `useScrollAnimation`).

## Services & APIs
- `services/apiService.ts`: `fetch` wrappers hacia Cloudflare Workers (`functions/api`).
- `services/supabaseService.ts`: cliente Supabase por entorno.
- Cloudflare Workers in `functions/api`: registro, checkout, portal, webhooks, uploads, correos.

## Data Schemas
- `schemas/registrationSchema.ts`: zod schema para formulario de registro.

## Assets & Styles
- Estilos globales en `src/index.css` con Tailwind 4.
- Imágenes en `/images` y `/public`.

## Migración a Next.js
- Reutilizar contenido de páginas públicas y portal en nuevas rutas App Router.
- Convertir UI primitives a componentes shadcn/ui manteniendo estilos existentes.
- Trasladar lógica de APIs (Cloudflare Workers) a rutas `app/api/*`.
- Simplificar servicios para usar `@supabase/auth-helpers-nextjs` y `@tanstack/react-query`.

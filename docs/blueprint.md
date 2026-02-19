# MIA React App Audit

## Existing Pages (`src/pages`)
- `HomePage.tsx`: landing content with hero, CTA to membership and registration.
- `AboutPage.tsx`: misión/visión, CTA hacia registro y talleres.
- `MembershipPage.tsx`: detalles de membresía, planes, beneficios y CTA checkout.
- `MianimaPage.tsx`: información de programa Miánima con galería y FAQs.
- `SociasPage.tsx`: listado de socias con filtros y datos básicos.
- `DirectivaPage.tsx`: directiva actual con soporte para años anteriores vía API.
- `SimpleRegistrationPage.tsx`: formulario de registro abreviado (hook form + zod schema).
- `RegistrationPage.tsx`: formulario de registro con Stripe Checkout.
- `WelcomePage.tsx`: pantalla posterior a registro.
- `ContactPage.tsx`, `PoliticaPrivacidadPage.tsx`, `PoliticaCookiesPage.tsx`, `TerminosUsoPage.tsx`: páginas informativas y formulario de contacto.

## Shared Components (`src/components`)
- Layout: `Header`, `Footer`, `Layout`, `ErrorBoundary`, `ProtectedRoute`.
- UI primitives (`src/components/ui`): botón, tarjeta, diálogo, tabs, etc. implementados con Radix + Tailwind.
- Utilities: `VimeoVideo`, `ProfileImage`, social icons.

## Context & Hooks
- `AuthContext`, `useAuth`: autenticación (stub, no funcional).
- `ToastContext`, `useToast`: notificaciones globales.
- `LoadingContext`: estado de carga.
- Hooks de animación (`useCounterAnimation`, `useScrollAnimation`).

## Services & APIs
- Cloudflare Functions in `functions/api`:
  - `contact.ts`: formulario de contacto con Turnstile
  - `create-stripe-checkout.ts`: crear sesión de checkout
  - `stripe-session.ts`: verificar sesión de pago

## Data Schemas
- `schemas/registrationSchema.ts`: zod schema para formulario de registro.

## Assets & Styles
- Estilos globales en `src/index.css` con Tailwind 4.
- Imágenes en `/images` y `/public`.

## Notas de Implementación
- Arquitectura actual: React 19 + Cloudflare Pages (simple y escalable)
- Datos estáticos: directiva y fundadoras almacenados en `src/data/`
- Integración Stripe: checkout directo sin portal de miembros
- Authentication: actualmente stub (no implementado)

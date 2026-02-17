# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MIA (Mujeres en la Industria de Animación) is a professional association web application for women in the animation industry in Spain. Built with React 19, TypeScript, Vite, and deployed on Cloudflare Pages with serverless Functions.

**Tech Stack:**
- React 19 + TypeScript + Vite
- Tailwind CSS 4 + Radix UI (shadcn/ui pattern)
- React Router 7 for routing
- Stripe for payments (direct payment links - no server-side sessions)
- Cloudflare Pages + Functions for hosting and serverless APIs
- Cloudflare Turnstile for CAPTCHA protection
- Form validation: react-hook-form + Zod
- Static data for directiva and fundadoras (no backend integration)
- **No authentication** - fully static site with public pages only

## Development Commands

```bash
# Start development server (opens on port 3000)
npm run dev

# Run linter
npm run lint

# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Build for production
npm run build

# Build for development environment
npm run build:dev

# Preview production build locally
npm run preview

# Deploy to development environment
npm run deploy:dev

# Manual deploy to development
npm run deploy:dev:manual
```

### Testing Cloudflare Functions Locally

```bash
# Start Cloudflare Functions dev server
npx wrangler dev

# Test with Stripe CLI for webhooks
stripe listen --forward-to http://localhost:8788/api/stripe-webhook
```

## Architecture

### Path Aliases

The project uses TypeScript path aliases (configured in tsconfig.json and vite.config.ts):

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

### Directory Structure

```
src/
├── components/       # Reusable components
│   ├── ui/          # Radix UI primitives (shadcn/ui pattern)
│   ├── Header.tsx   # Main navigation
│   ├── Footer.tsx
│   └── Layout.tsx   # Page layout wrapper
├── pages/           # Route components
│   └── socias/     # Subdirectory for Socias page components
├── contexts/        # React Context providers (Toast, Loading)
├── hooks/           # Custom React hooks
├── types/           # TypeScript type definitions
├── config/          # App configuration (site.config.ts)
├── schemas/         # Zod validation schemas
├── utils/           # Utility functions
└── App.tsx          # Root component with routes

functions/           # Cloudflare Functions (serverless APIs)
└── api/
    └── contact.ts   # Contact form API with Turnstile verification
```

### State Management

The app uses React Context API for global state:

- **ToastContext** (`src/contexts/ToastContext.tsx`): Global notifications
- **LoadingContext** (`src/contexts/LoadingContext.tsx`): Loading states

Access these via their respective hooks: `useToast()`, `useLoading()`

### Forms and Validation

Forms use react-hook-form with Zod schemas:
- Schemas defined in `src/schemas/` (e.g., `registrationSchema.ts`)
- Form components use `useForm` hook with `zodResolver`
- Validation errors are displayed inline

### UI Components

UI components follow the shadcn/ui pattern:
- Located in `src/components/ui/`
- Built with Radix UI primitives + Tailwind CSS
- Use `cn()` utility from `@/lib/utils` for className merging
- Component variants defined using class-variance-authority (cva)

### Cloudflare Functions

Serverless API endpoints in `functions/api/`:
- Each file exports `onRequestPost`, `onRequestGet`, etc.
- Access environment variables via `env` parameter
- Use Cloudflare Turnstile for form protection
- CORS headers configured for cross-origin requests

Environment variables are split:
- Public: `VITE_*` (safe to expose, in wrangler.toml)
- Secrets: Managed via `wrangler secret put` (Stripe keys, Supabase service role)

### Routing

Routes defined in `src/App.tsx` using React Router 7:
- All routes are public and wrapped in `<Layout>` component
- Registration page (`/registro`) redirects directly to Stripe payment links
- No authentication or protected routes

### Configuration

`src/config/site.config.ts` contains environment-aware configuration:
- Detects dev/production via hostname
- Contains Stripe payment links, Turnstile keys, analytics IDs
- Exported as const for type safety

### Payment Flow

**Registration and Payment:**
1. User selects membership on `/registro`
2. Applies optional discount code
3. Accepts terms and GDPR policy
4. Clicks "Proceder al Pago"
5. Redirects to Stripe hosted payment link
6. Stripe handles checkout and confirmation
7. No custom welcome page or server-side session tracking

### MCP Server

The project has a Supabase MCP server configured in `.mcp.json`:
- Project ref: `sggnohsrpdhbsavzccfw`
- **Note**: Currently kept for reference only. Not actively used since Supabase integration was removed.
- To use: Uncomment in `.mcp.json` and run Claude Code with MCP support

### Animation Specializations

Member specializations are defined in `src/types/index.ts` as a const array `ANIMATION_SPECIALIZATIONS`. This is the source of truth for all animation profession categories (40+ specializations like "Guión", "Dirección", "Animación 2D", etc.). Use this when building member filters or forms.

## Development Guidelines

### Code Style

- TypeScript strict mode enabled
- Use functional components with hooks
- Prefer const arrow functions for component definitions
- Use explicit return types for complex functions
- Keep components under 200 lines; extract sub-components if needed

### Adding New Pages

1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Update Header navigation if needed
4. Use `<Layout>` wrapper for consistent header/footer

### Adding New API Endpoints

1. Create handler in `functions/api/[name].ts`
2. Export `onRequestPost`, `onRequestGet`, etc.
3. Add CORS headers if needed
4. Define TypeScript types in `src/types/api.ts`
5. Test locally with `npx wrangler dev`

### Working with Forms

1. Create Zod schema in `src/schemas/`
2. Use `useForm` with `zodResolver`
3. Add Turnstile verification for public forms
4. Handle submission in Cloudflare Function

### Deployment

- **Development**: `npm run deploy:dev` (deploys to dev.animacionesmia.com)
- **Production**: Automatic from `main` branch via Cloudflare Pages
- Set secrets via: `npx wrangler secret put SECRET_NAME`

Required secrets in Cloudflare:
- `TURNSTILE_SECRET_KEY` (for contact form CAPTCHA)
- `ZAPIER_WEBHOOK_URL` (optional, for contact form notifications)

### Environment Variables

Development `.env` file should contain:
```env
VITE_STRIPE_PUBLIC_KEY=pk_test_...  # For Stripe payment links (stored in site.config.ts)
VITE_TURNSTILE_SITE_KEY=0x4AAA...
TURNSTILE_SECRET_KEY=0x4AAA...
ZAPIER_WEBHOOK_URL=https://hooks.zapier.com/... (optional)
```

## Common Patterns

### Using Context

```typescript
import { useToast } from '@/hooks/useToast';
import { useLoading } from '@/hooks/useLoading';

const { showToast } = useToast();
const { setLoading } = useLoading();
```

### Form Handling

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { mySchema } from '@/schemas/mySchema';

const form = useForm({
  resolver: zodResolver(mySchema),
  defaultValues: { ... }
});
```

### Conditional Styling

```typescript
import { cn } from '@/lib/utils';

<div className={cn(
  "base-classes",
  condition && "conditional-classes"
)} />
```

## Known Issues and TODOs

- SociasPage is incomplete (shows "Coming Soon" placeholder)
- Directiva data needs updates (see TODOs in `src/data/directiva.ts`)
- Membership stats in HomePage are manually updated (see TODO comment)

## Git Workflow

Follow conventional commits:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test additions/changes
- `chore:` - Maintenance tasks

Main branch: `main`
Development branch: `dev`

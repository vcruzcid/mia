# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
```bash
npm run dev      # Start development server on port 3000
npm run build    # Build for production (includes TypeScript compilation)
npm run lint     # Run ESLint
npm run preview  # Preview production build locally
```

### Development Workflow
- Development server runs on port 3000 and auto-opens browser
- Build process includes TypeScript compilation (`tsc -b`) before Vite build
- Source maps are enabled in production builds
- Manual chunks are configured for optimal bundle splitting

## Project Architecture

### Tech Stack Foundation
- **React 19** with TypeScript and SWC for fast compilation
- **Vite** with PWA plugin for progressive web app capabilities  
- **TanStack Query** for server state management and caching
- **Zustand** for client-side state management
- **React Router v7** for navigation with protected routes
- **React Hook Form + Zod** for form handling and validation
- **Tailwind CSS v4** with custom UI components using Radix UI primitives

### Application Structure

#### Core App Setup
- `App.tsx` defines the main routing structure with nested layouts
- Error boundaries wrap the entire application
- Multiple context providers: Auth, Toast, Loading, QueryClient
- Public routes use `Layout` wrapper, auth routes are separate
- Protected routes require authentication via `ProtectedRoute` component

#### State Management Architecture
- **Global State**: Zustand stores in `/src/store/`
  - `galleryStore.ts` - Member gallery filtering and search
  - `membershipStore.ts` - Membership form state
- **Server State**: TanStack Query with configured client in `/src/lib/queryClient.ts`
- **Form State**: React Hook Form with Zod schemas in `/src/schemas/`
- **Context State**: React contexts for Auth, Toast notifications, Loading states

#### Authentication & Services
- Authentication handled through `AuthContext` with Supabase backend
- Services layer in `/src/services/`:
  - `authService.ts` - Authentication operations
  - `supabaseService.ts` - Database operations
  - `apiService.ts` - External API integrations
- Protected routes require authentication, public routes redirect authenticated users

#### Component Architecture
- **Layout Components**: `Header`, `Footer`, `Layout` provide consistent structure
- **UI Components**: Radix UI-based components in `/src/components/ui/`
- **Page Components**: Feature-complete pages in `/src/pages/`
- **Specialized Components**: `ErrorBoundary`, `ProtectedRoute`, `ProfileImage`, `SocialMediaIcons`

### Key Configuration Files

#### Site Configuration (`src/config/site.config.ts`)
Central configuration for:
- Stripe payment links (different membership types)
- Cloudflare Turnstile bot protection
- Google Analytics tracking
- Mailchimp integration
- Site metadata and URLs

#### Path Aliases (Vite config)
```typescript
'@/*': '/src/*'
'@/components': '/src/components'
'@/lib': '/src/lib'
// Additional aliases for all major directories
```

#### Build Optimization
- Manual chunk splitting for vendor libraries, router, query, and forms
- PWA configuration with service worker and offline capabilities
- Font caching strategies for Google Fonts
- Source maps enabled for debugging

### TypeScript Integration

#### Type Definitions (`src/types/index.ts`)
- **MembershipType**: Stripe integration and benefits
- **Member & DirectivaMember**: Complete user profiles with specializations
- **FormData interfaces**: Registration and contact forms  
- **ApiResponse**: Standardized API response format
- **FilterState & GalleryState**: Member filtering and search
- **Animation Specializations**: Comprehensive list of industry roles

#### Schemas (`src/schemas/`)
Zod schemas for form validation integrated with TypeScript types

### Environment Variables
Required environment variables for full functionality:
```
VITE_STRIPE_PLENO_DERECHO_URL
VITE_STRIPE_ESTUDIANTE_URL  
VITE_STRIPE_COLABORADOR_URL
VITE_TURNSTILE_SITE_KEY
VITE_GOOGLE_ANALYTICS_ID
```

## Important Implementation Details

### Membership System
- Three membership types: Pleno Derecho (€30), Estudiante (€15), Colaborador (€50)
- Stripe integration with separate payment links for each type
- Registration flow includes Turnstile bot protection
- Mailchimp integration for newsletter subscriptions

### Member Gallery System  
- Complex filtering by member type, specialization, location, availability
- Search functionality across member profiles
- Modal system for detailed member profiles
- Historical directiva (board) member tracking with year-based filtering

### Authentication Flow
- Public pages accessible without authentication
- Login page redirects authenticated users to portal
- Protected portal page requires authentication
- Welcome page shown after successful registration

### Performance Considerations
- Lazy loading implemented through React Router
- TanStack Query handles caching and background refetching
- Manual chunk splitting reduces initial bundle size
- PWA capabilities for offline functionality

When working with this codebase, always check existing patterns in similar components before creating new functionality. The application follows consistent patterns for form handling, state management, and component structure.
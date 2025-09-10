# Architecture and Design Patterns

## State Management
- **Zustand** for client-side global state (membership store)
- **TanStack Query** for server state management and caching
- **React Hook Form** for form state management

## Form Handling Pattern
- React Hook Form + Zod validation schema
- Type-safe form data with TypeScript interfaces
- Consistent error handling and display

## Component Architecture
- **Layout Component** with nested routes using React Router
- **Page Components** for each route (HomePage, AboutPage, etc.)
- **Shared Components** in components/ directory (Header, Footer, Layout)
- **Custom Hooks** for reusable logic (animations, scroll effects)

## Configuration Pattern
- Centralized site configuration in `config/site.config.ts`
- Type-safe configuration with `as const` assertions
- Environment variable integration for sensitive data

## Animation Patterns
- Custom hooks for scroll-based animations
- Counter animations for statistics
- Intersection Observer for scroll triggers

## Membership System
- Three membership types: Pleno Derecho, Estudiante, Colaborador
- Stripe integration for payments
- Form validation with Zod schemas
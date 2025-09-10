# MIA React App - Code Style & Conventions

## TypeScript Configuration
- **Strict mode enabled** - Full type safety
- **ES2022 target** - Modern JavaScript features
- **React JSX** - JSX transform without React import
- **No unused variables/parameters** - Enforced by compiler
- **Strict linting** - ESLint with TypeScript rules

## Code Organization Patterns

### Component Structure
- **Function components** - No class components
- **Named exports** - `export function ComponentName()`
- **Props typing** - Interface definitions for all props
- **Hooks usage** - useState, useLocation, custom hooks

### File Naming
- **PascalCase** - For component files (Header.tsx, HomePage.tsx)
- **camelCase** - For utility files (site.config.ts, queryClient.ts)
- **kebab-case** - For routes (/sobre-mia, /membresia)

### Import Organization
- **External libraries first** - React, third-party packages
- **Internal imports** - Relative imports from project
- **Type imports** - Using `type` keyword when importing types

### State Management
- **Zustand stores** - For global state with devtools integration
- **React Hook Form** - For form state with Zod validation
- **TanStack Query** - For server state management

## Styling Conventions
- **Tailwind CSS classes** - Utility-first approach
- **Custom color scheme** - Primary colors using red palette
- **Responsive design** - Mobile-first with breakpoint prefixes
- **Component variants** - Defined in index.css @layer components

## Form Handling
- **Zod validation** - Schema-first validation with TypeScript inference
- **Spanish error messages** - User-facing text in Spanish
- **React Hook Form** - Performance-optimized form management
- **Controlled components** - Form inputs managed by React Hook Form

## Configuration Management
- **Centralized config** - All settings in site.config.ts
- **Type safety** - Configuration types exported
- **Environment separation** - Ready for env variables
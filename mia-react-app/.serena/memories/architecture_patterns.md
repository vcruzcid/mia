# MIA React App - Architecture Patterns & Guidelines

## Component Architecture

### Page Components
- **Location**: `src/pages/`
- **Pattern**: One component per route
- **Responsibility**: Page-level layout and data fetching
- **Example**: `HomePage`, `MembershipPage`, `ContactPage`

### Layout Components
- **Pattern**: Wrapper components for common UI structure
- **Header/Footer**: Persistent navigation elements
- **Layout**: Outlet-based routing with React Router

### Form Architecture
- **React Hook Form**: Primary form library
- **Zod Validation**: Schema-based validation
- **Error Handling**: Spanish language error messages
- **State**: Local form state with global submission state

## State Management Strategy

### Global State (Zustand)
- **Membership Store**: User's membership selection state
- **Pattern**: Action-based updates with devtools integration
- **Usage**: Cross-component state that persists during session

### Server State (TanStack Query)
- **Configuration**: Centralized in `lib/queryClient.ts`
- **Caching**: 5-minute stale time, 10-minute garbage collection
- **Error Handling**: Automatic retry logic for network errors

### Local State (useState)
- **UI State**: Menu open/close, form field states
- **Component-specific**: State that doesn't need to be shared

## Routing Pattern
- **React Router v7**: Nested routes with layout components
- **Structure**: Layout wrapper with page outlets
- **URLs**: Spanish-friendly routes (`/sobre-mia`, `/membresia`)

## Configuration Management
- **Centralized**: All config in `src/config/site.config.ts`
- **Type Safety**: Exported types for configuration
- **External Services**: API keys, URLs, and service configuration

## Styling Architecture
- **Tailwind CSS**: Utility-first approach
- **Custom Components**: Defined in `@layer components`
- **Color System**: Consistent primary color palette (red theme)
- **Responsive**: Mobile-first design patterns

## Error Handling
- **Form Validation**: Client-side with Zod schemas
- **Network Errors**: Handled by TanStack Query retry logic
- **User Feedback**: Spanish error messages for forms
- **Graceful Degradation**: Fallbacks for failed operations

## Performance Considerations
- **Code Splitting**: React Router handles route-based splitting
- **Bundle Optimization**: Vite handles tree shaking
- **Image Optimization**: SVG icons, optimized image formats
- **Lazy Loading**: Components loaded on demand via routing
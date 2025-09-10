# Task Completion Workflow

## After Making Code Changes
1. **Lint**: Run `npm run lint` to check for ESLint violations
2. **Build**: Run `npm run build` to verify TypeScript compilation and create production bundle
3. **Test locally**: Use `npm run dev` to test changes in development
4. **Preview**: Use `npm run preview` to test the production build locally

## Important Notes
- **No separate typecheck command** - TypeScript checking is included in the build process
- The build command runs `tsc -b && vite build` which ensures type checking before bundling
- ESLint configuration is strict and includes React hooks and TypeScript rules
- All code must pass linting and build successfully before being considered complete

## Git Workflow
- Project is currently on `dev` branch
- Main branch is `main` (use for PRs)
- Recent commits show feature development and React migration

## Environment Variables
The app expects environment variables for:
- Stripe payment URLs
- Turnstile site key  
- Google Analytics ID
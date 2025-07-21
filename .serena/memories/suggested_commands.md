# Essential Commands for MIA React App

## Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production (runs TypeScript compilation then Vite build)
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Build Process
The build command runs TypeScript compilation first (`tsc -b`) then Vite build. This ensures type checking before bundling.

## System Commands (macOS/Darwin)
- `git` - Version control
- `ls` - List files
- `find` - Search for files
- `grep` - Search within files
- `cd` - Change directory

## Important Notes
- No separate typecheck command exists - use `npm run build` which includes TypeScript compilation
- The project uses ES modules (`"type": "module"` in package.json)
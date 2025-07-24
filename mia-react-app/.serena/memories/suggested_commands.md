# MIA React App - Essential Commands

## Development Commands
```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run linter
npm run lint
```

## Project Setup
```bash
# Install dependencies
npm install

# Clean install (if issues)
rm -rf node_modules package-lock.json && npm install
```

## Development Workflow
```bash
# Start dev server (usually runs on http://localhost:5173)
npm run dev

# In separate terminal, run linting during development
npm run lint

# Before committing, build to check for errors
npm run build
```

## System Commands (macOS)
```bash
# File operations
ls -la                  # List files with details
find . -name "*.tsx"    # Find React component files
grep -r "searchterm"    # Search in files

# Git operations
git status
git add .
git commit -m "message"
git push

# Process management
lsof -ti:5173 | xargs kill  # Kill dev server if stuck
```

## Testing Build
```bash
# Test full build process
npm run build

# Serve built files locally
npm run preview
```

## Troubleshooting
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Clear all build artifacts
rm -rf dist node_modules/.tmp

# TypeScript check
npx tsc --noEmit
```

## Port Information
- **Dev server**: Usually http://localhost:5173
- **Preview server**: Usually http://localhost:4173
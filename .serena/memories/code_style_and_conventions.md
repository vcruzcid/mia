# Code Style and Conventions

## TypeScript Configuration
- Strict mode enabled with comprehensive linting rules
- ES2022 target with modern features
- JSX with react-jsx transform
- Unused locals and parameters not allowed
- No fallthrough cases in switch statements

## Code Style
- **ES Modules**: Use import/export syntax (not CommonJS require)
- **Destructured imports**: Prefer `import { Component } from 'library'`
- **File naming**: PascalCase for components (e.g., `HomePage.tsx`)
- **Function declarations**: Use `function` keyword for components
- **Interface naming**: PascalCase without "I" prefix

## Project Structure
```
src/
├── components/     # Reusable UI components
├── pages/         # Route-level page components  
├── hooks/         # Custom React hooks
├── store/         # Zustand state stores
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
├── config/        # Configuration files
└── lib/           # Third-party library setups
```

## Styling
- **Tailwind CSS** for styling with utility classes
- Custom color palette with primary red theme
- Inter font family as default
- Responsive mobile-first approach
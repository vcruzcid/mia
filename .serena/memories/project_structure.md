# MIA React App - Project Structure

## Root Directory
```
├── src/                 # Source code
├── public/              # Static assets
├── dist/                # Build output (generated)
├── node_modules/        # Dependencies
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── postcss.config.js    # PostCSS configuration
├── eslint.config.js     # ESLint configuration
├── vite.config.ts       # Vite build tool configuration
└── README.md           # Project documentation
```

## Source Directory Structure
```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx      # Main navigation header
│   ├── Footer.tsx      # Site footer
│   └── Layout.tsx      # Page layout wrapper
├── pages/              # Page components (route handlers)
│   ├── HomePage.tsx    # Landing page
│   ├── AboutPage.tsx   # About MIA page
│   ├── MembershipPage.tsx # Membership registration
│   └── ContactPage.tsx # Contact form
├── config/             # Configuration files
│   └── site.config.ts  # Site-wide settings
├── store/              # Zustand stores
│   └── membershipStore.ts # Membership state
├── types/              # TypeScript type definitions
│   └── index.ts        # Shared interfaces
├── utils/              # Utility functions
│   ├── memberships.ts  # Membership data/logic
│   └── validation.ts   # Form validation schemas
├── lib/                # Third-party library configs
│   └── queryClient.ts  # React Query configuration
├── hooks/              # Custom React hooks (empty)
├── assets/             # Static assets
└── App.tsx             # Root component with routing
```

## Key Files
- **App.tsx**: Root component with React Router setup
- **main.tsx**: Application entry point
- **index.css**: Global styles with Tailwind imports
- **site.config.ts**: Centralized configuration for URLs, keys, etc.
# Mujeres en la Industria de Animación (MIA) - React App

A modern React application for the MIA (Mujeres en la Industria de Animación) association, built with cutting-edge web technologies.

## 🚀 Tech Stack

- **React 18** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Hook Form** - Performant forms with easy validation
- **Zod** - TypeScript-first schema validation
- **TanStack Query** - Powerful data synchronization
- **Zustand** - Lightweight state management

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── Layout.tsx
├── pages/              # Page components
│   ├── HomePage.tsx
│   ├── AboutPage.tsx
│   ├── MembershipPage.tsx
│   └── ContactPage.tsx
├── config/             # Configuration files
│   └── site.config.ts
├── hooks/              # Custom React hooks
├── store/              # Zustand stores
│   └── membershipStore.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── utils/              # Utility functions
│   ├── memberships.ts
│   └── validation.ts
└── lib/                # Third-party library configurations
    └── queryClient.ts
```

## 🔧 Configuration

The application includes comprehensive configuration for:

- **Site Settings**: URLs, analytics, payment links
- **Stripe Integration**: Multiple membership payment options
- **Turnstile**: Cloudflare bot protection
- **Google Analytics**: User tracking and insights
- **Mailchimp**: Newsletter management

## 💳 Membership Types

- **Socia de Pleno Derecho** (€30/year) - For active industry professionals
- **Socia Estudiante** (€15/year) - For animation students
- **Colaborador/a** (€50/year) - For supporters and companies

## 🛠️ Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone [repository-url]
cd mia-react-app

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🎨 Features

### Responsive Design
- Mobile-first approach
- Optimized for all device sizes
- Modern UI/UX with Tailwind CSS

### Form Handling
- Type-safe forms with React Hook Form
- Comprehensive validation with Zod
- Real-time error feedback

### State Management
- Global state with Zustand
- Server state with TanStack Query
- Optimistic updates and caching

### Performance
- Code splitting with React Router
- Optimized bundle size
- Fast refresh during development

## 🚀 Deployment

The application is optimized for deployment on:

- **Vercel** (recommended)
- **Netlify**
- **Static hosting** (build folder)

### Build Command
```bash
npm run build
```

### Environment Variables

Create a `.env` file with the following variables:

```env
VITE_STRIPE_PLENO_DERECHO_URL=your_stripe_url
VITE_STRIPE_ESTUDIANTE_URL=your_stripe_url
VITE_STRIPE_COLABORADOR_URL=your_stripe_url
VITE_TURNSTILE_SITE_KEY=your_turnstile_key
VITE_GOOGLE_ANALYTICS_ID=your_ga_id
```

## 📝 License

Private - Mujeres en la Industria de Animación

## 🤝 Contributing

This is a private project for MIA. Please contact the organization for contribution guidelines.

---

Built with ❤️ for the animation industry community in Spain.
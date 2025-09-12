# MIA - Mujeres en la Industria de Animación

Modern React application for the MIA association website.

## 🚀 Tech Stack

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** + **React Router** + **TanStack Query**
- **Supabase** (Backend) + **Cloudflare Pages** (Hosting)

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed

# Run dev tests only
npm run test:dev

# Clean up dev files before committing
npm run cleanup
```

## 🔧 Environment Variables

### Local Development
Create a `.env` file:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Production
- **Public variables**: Managed in `wrangler.toml`
- **Sensitive variables**: Managed through Cloudflare secrets

## 🚀 Deployment

Deployed on **Cloudflare Pages** with:
- Automatic builds from `main` branch
- Edge functions for API endpoints
- Secrets management for sensitive data

## 📝 License

Private - Mujeres en la Industria de Animación
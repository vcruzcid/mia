# MIA React App - Cloudflare Pages Deployment Guide

## Overview
This guide covers deploying the MIA React app to Cloudflare Pages for the development environment at `dev.animacionesmia.com`.

## Prerequisites
- Cloudflare account
- GitHub repository access
- Node.js 18+ installed locally

## Deployment Steps

### 1. Cloudflare Pages Setup

1. **Login to Cloudflare Dashboard**
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Navigate to "Workers & Pages" → "Create application" → "Pages"

2. **Connect Git Repository**
   - Click "Connect to Git"
   - Authorize Cloudflare to access your GitHub account
   - Select your repository: `NAVIC.nosync/mia`
   - Choose the `dev` branch for development deployments

3. **Configure Build Settings**
   ```
   Framework preset: Vite
   Production branch: dev
   Build command: npm run build
   Build output directory: dist
   Root directory: mia-react-app
   ```

### 2. Environment Variables

Set these environment variables in Cloudflare Pages dashboard:

**Required Variables:**
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PLENO_DERECHO_URL=https://pagos.animacionesmia.com/b/9B69ASapSeBh13e81x7g401
VITE_STRIPE_ESTUDIANTE_URL=https://pagos.animacionesmia.com/b/00w28qcy0gJp27i3Lh7g402
VITE_STRIPE_COLABORADOR_URL=https://pagos.animacionesmia.com/b/9B65kC41ubp5eU495B7g403Og2Sz5ju2Hd7g400
VITE_TURNSTILE_SITE_KEY=0x4AAAAAABddjw-SDSpgjBDI
VITE_GOOGLE_ANALYTICS_ID=G-YLBF3GWPRV
```

### 3. Custom Domain Setup

1. **Add Custom Domain**
   - In your Pages project → "Custom domains"
   - Click "Set up a custom domain"
   - Enter: `dev.animacionesmia.com`

2. **DNS Configuration**
   - In Cloudflare DNS settings, add:
   ```
   Type: CNAME
   Name: dev
   Content: your-project.pages.dev
   Proxy: Enabled (orange cloud)
   ```

### 4. Supabase Configuration

Update your Supabase project settings:

1. **Authentication Settings**
   - Add `https://dev.animacionesmia.com` to Site URL
   - Add `https://dev.animacionesmia.com/**` to Redirect URLs

2. **CORS Configuration**
   - Add `https://dev.animacionesmia.com` to allowed origins

### 5. Deployment Commands

**Manual Deployment (if needed):**
```bash
# Build the project
npm run build

# Deploy using Wrangler
npx wrangler pages deploy dist --project-name=mia-dev
```

**Automatic Deployment:**
- Push to `dev` branch triggers automatic deployment
- Preview deployments for pull requests

### 6. Verification

After deployment, verify:
- [ ] Site loads at `https://dev.animacionesmia.com`
- [ ] Authentication works
- [ ] Stripe payments function
- [ ] All forms submit correctly
- [ ] PWA features work

## Troubleshooting

### Build Failures
- Check Node.js version (18+ required)
- Verify all dependencies are in package.json
- Check build logs in Cloudflare Pages dashboard

### Environment Variables
- Ensure all VITE_ prefixed variables are set
- Check variable names match exactly
- Redeploy after adding new variables

### Domain Issues
- Verify DNS propagation (can take up to 24 hours)
- Check SSL certificate status
- Ensure CNAME record points to correct Pages URL

## Cost Information

**Cloudflare Pages Free Tier:**
- 500 builds per month
- 20,000 requests per month
- 500 MB bandwidth per month
- Unlimited static sites

## Security Features

- Automatic HTTPS/SSL
- DDoS protection
- Web Application Firewall (WAF)
- Bot management
- Image optimization

## Performance Features

- Global CDN distribution
- Automatic minification
- Compression
- Caching optimization
- Edge computing capabilities

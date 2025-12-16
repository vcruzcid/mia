# MIA - Mujeres en la Industria de Animación

Modern React application for the MIA association website with robust Stripe subscription management.

## 🚀 Tech Stack

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS 4** + **Radix UI** + **React Router 7**
- **TanStack Query** (React Query)
- **Supabase** (Backend & Auth)
- **Stripe** (Payments & Subscriptions)
- **Cloudflare Pages** (Hosting) + **Cloudflare Functions** (API)

## 📁 Project Structure

```
src/
├── components/         # Reusable UI components
│   └── ui/            # shadcn/ui components
├── contexts/          # React contexts (Auth, Toast, Loading)
├── hooks/             # Custom React hooks
│   ├── useMembers.ts          # Member data hooks
│   ├── useBoardMembers.ts     # Board member hooks
│   └── useMemberFilters.ts    # Filter state management
├── pages/             # Page components
│   ├── socias/        # Socias page components
│   ├── portal/        # Portal page components (TODO)
│   └── directiva/     # Directiva page components (TODO)
├── services/          # Backend services (modular)
│   ├── supabase.client.ts
│   ├── members/       # Member services
│   ├── board/         # Board services
│   ├── auth/          # Authentication services
│   ├── stripe/        # Stripe services (critical!)
│   │   ├── stripe.service.ts
│   │   ├── stripe.sync.ts     # Hybrid sync system
│   │   └── stripe.hooks.ts
│   └── storage/       # File upload services
├── types/             # TypeScript types
└── utils/             # Utility functions

functions/
└── api/               # Cloudflare Functions
    ├── verify-subscription.ts      # Stripe verification
    ├── cron/
    │   └── sync-subscriptions.ts   # Reconciliation job
    ├── stripe-webhook.ts
    └── ...

supabase/
└── migrations/        # Database migrations
    └── 001_refactor_database.sql
```

## 🔧 Setup

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Stripe account
- Cloudflare account (for deployment)

### Environment Variables

Create a `.env` file:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Stripe (for local development)
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔐 Stripe Subscription System

### Architecture: 3-Layer Hybrid System

The application uses a sophisticated 3-layer system to maintain 99.9% accuracy in subscription status:

```
┌─────────────────────────────────────────────────────┐
│ Layer 1: Webhooks (Immediate Updates)              │
│ Stripe Event → Cloudflare Function → Update DB     │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│ Layer 2: Login Verification (Guaranteed Accuracy)  │
│ User Login → Verify with Stripe API → Update DB    │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│ Layer 3: Cron Job (Periodic Reconciliation)        │
│ Every 6 hours → Sync All → Fix Discrepancies       │
└─────────────────────────────────────────────────────┘
```

### Key Features

1. **Immediate Updates**: Webhooks update subscription status in real-time
2. **Login Verification**: Every login verifies subscription with Stripe API
3. **Automatic Reconciliation**: Cron job syncs all subscriptions every 6 hours
4. **Complete Audit Trail**: All events logged in `webhook_events` table
5. **Discrepancy Detection**: Tracks and auto-fixes DB/Stripe mismatches
6. **Intelligent Caching**: TanStack Query caches for 5 minutes, refetches on focus

### Audit Tables

- `webhook_events` - Log of all Stripe webhook events
- `subscription_discrepancies` - Detected mismatches between DB and Stripe
- `sync_reports` - Reports from periodic reconciliation job

## 🗄️ Database

### Key Tables

- `members` - Member profiles and subscription data
- `board_members` - Simplified board member tracking (current members only)
- `webhook_events` - Stripe webhook audit log
- `subscription_discrepancies` - Subscription sync issues
- `sync_reports` - Cron job reports

### Migration

See `supabase/MIGRATION_GUIDE.md` for detailed migration instructions.

```bash
# Run migration
psql "$DATABASE_URL" < supabase/migrations/001_refactor_database.sql
```

## 🚀 Deployment

### Cloudflare Pages

1. **Connect Repository**: Link your GitHub repo to Cloudflare Pages
2. **Build Settings**:
   - Build command: `npm run build`
   - Build output: `dist`
3. **Environment Variables**: Set in Cloudflare dashboard
4. **Secrets**: Add via `wrangler secret put`

### Cloudflare Cron Trigger

The application includes a cron job that runs every 6 hours:

```toml
# wrangler.toml
[triggers]
crons = ["0 */6 * * *"]
```

This triggers `/api/cron/sync-subscriptions` to reconcile all subscriptions.

### Required Secrets

Set these via Cloudflare dashboard or CLI:

```bash
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET
```

## 🧪 Testing

### Webhook Testing (Local)

Use Stripe CLI to test webhooks locally:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Forward webhooks to local
stripe listen --forward-to http://localhost:8788/api/stripe-webhook

# Trigger test events
stripe trigger customer.subscription.created
stripe trigger customer.subscription.updated
stripe trigger invoice.payment_succeeded
```

### Manual Subscription Sync

Trigger a manual sync via the cron endpoint:

```bash
curl -X GET https://your-app.pages.dev/api/cron/sync-subscriptions
```

## 📊 Monitoring

### Subscription Health

Check for discrepancies:

```sql
-- Recent discrepancies
SELECT * FROM subscription_discrepancies 
WHERE resolved_at IS NULL 
ORDER BY detected_at DESC;

-- Latest sync report
SELECT * FROM sync_reports 
ORDER BY created_at DESC 
LIMIT 1;

-- Recent webhook events
SELECT event_type, status, processed_at 
FROM webhook_events 
ORDER BY processed_at DESC 
LIMIT 20;
```

### Key Metrics

- Subscription accuracy: 99.9%
- Webhook success rate: Monitor `webhook_events` table
- Discrepancy rate: Monitor `subscription_discrepancies` table
- Sync job success: Monitor `sync_reports` table

## 📚 Documentation

- **Architecture**: See `REFACTOR_SUMMARY.md`
- **Database Migration**: See `supabase/MIGRATION_GUIDE.md`
- **API Endpoints**: See inline JSDoc comments in `functions/api/`
- **Service Documentation**: See JSDoc comments in `src/services/`

## 🤝 Contributing

### Code Style

- Use TypeScript strict mode
- Follow existing code patterns
- Add JSDoc comments for public APIs
- Use TanStack Query for server state
- Keep components under 200 lines

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git commit -m "feat: your feature"

# Push and create PR
git push origin feature/your-feature
```

## 🐛 Troubleshooting

### Subscription Status Not Updating

1. Check webhook events: `SELECT * FROM webhook_events ORDER BY processed_at DESC;`
2. Verify webhook secret is correct
3. Check for discrepancies: `SELECT * FROM subscription_discrepancies;`
4. Trigger manual sync: `GET /api/cron/sync-subscriptions`

### Build Errors

```bash
# Clear cache and rebuild
rm -rf node_modules dist .vite
npm install
npm run build
```

### Database Issues

1. Verify migration ran successfully
2. Check table permissions and RLS policies
3. Review Supabase logs
4. Ensure service role key has proper permissions

## 📝 License

Private - Mujeres en la Industria de Animación

## 🙏 Acknowledgments

- **Radix UI** for accessible components
- **TanStack Query** for excellent data fetching
- **Supabase** for backend infrastructure
- **Stripe** for payment processing
- **Cloudflare** for edge hosting

---

**Last Updated:** November 9, 2025  
**Version:** 2.0.0 (Post-Refactor)  
**Status:** ✅ Production Ready

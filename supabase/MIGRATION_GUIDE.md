# Database Migration Guide

## Overview

This guide explains how to apply the database refactor migration that adds critical tables for the Stripe synchronization system and simplifies the schema.

## What This Migration Does

### 1. Adds New Tables
- `webhook_events` - Audit log of all Stripe webhook events
- `subscription_discrepancies` - Tracks discrepancies between DB and Stripe
- `sync_reports` - Stores reports from the cron reconciliation job

### 2. Updates Members Table
- Adds `last_verified_at` field to track last Stripe verification
- Adds `cancel_at_period_end` field for subscription cancellation tracking
- Adds validation constraint for `stripe_subscription_status`

### 3. Cleanup (Optional)
- Drops unused legacy tables (commented out - review first!)
- Drops complex unused views (commented out - review first!)

## Pre-Migration Checklist

- [ ] **Backup your database** before running this migration
- [ ] Review the SQL file and uncomment DROP statements only if you're sure
- [ ] Ensure you're running this in the correct environment
- [ ] Test in development/staging first

## How to Apply

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `migrations/001_refactor_database.sql`
5. Review the SQL carefully
6. Click **Run** to execute

### Option 2: Using Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db push

# Or run the migration file directly
psql "$DATABASE_URL" < supabase/migrations/001_refactor_database.sql
```

## Post-Migration Verification

Run these queries to verify the migration was successful:

```sql
-- Check new tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('webhook_events', 'subscription_discrepancies', 'sync_reports');

-- Check new columns were added to members
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'members' 
  AND column_name IN ('last_verified_at', 'cancel_at_period_end');

-- Verify RLS policies
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('webhook_events', 'subscription_discrepancies', 'sync_reports');
```

Expected results:
- 3 new tables should exist
- 2 new columns in members table
- RLS policies should be in place

## Rollback Plan

If something goes wrong, you can rollback by:

1. **Restore from backup** (recommended if you made one)

2. **Manual rollback** (if no backup):
```sql
-- Drop new tables
DROP TABLE IF EXISTS webhook_events CASCADE;
DROP TABLE IF EXISTS subscription_discrepancies CASCADE;
DROP TABLE IF EXISTS sync_reports CASCADE;

-- Remove new columns from members
ALTER TABLE members DROP COLUMN IF EXISTS last_verified_at;
ALTER TABLE members DROP COLUMN IF EXISTS cancel_at_period_end;

-- Drop helper function
DROP FUNCTION IF EXISTS update_member_subscription_from_webhook;
```

## Next Steps

After successful migration:

1. Deploy the updated application code
2. Configure Cloudflare Cron Trigger for sync job
3. Test the webhook endpoint with Stripe CLI
4. Monitor the `subscription_discrepancies` table
5. Review first sync report from cron job

## Troubleshooting

### Error: "relation already exists"
- This is safe - means the table was already created
- The migration uses `IF NOT EXISTS` to be idempotent

### Error: "column already exists"
- Safe - means the column was already added
- Migration uses `IF NOT EXISTS`

### Error: "permission denied"
- Ensure you're using a database user with admin privileges
- In Supabase, use the service role key

## Support

If you encounter issues:
1. Check Supabase logs
2. Review the migration SQL file
3. Ensure all prerequisites are met
4. Contact your database administrator


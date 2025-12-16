-- ===================================================================
-- Database Refactor Migration
-- ===================================================================
-- This migration simplifies the database schema and adds critical
-- tables for the hybrid Stripe synchronization system.
--
-- IMPORTANT: Review this script carefully before running in production!
-- Consider backing up your database first.
-- ===================================================================

-- 1. Add new audit tables for Stripe synchronization
-- ===================================================================

-- Table to log all webhook events for auditing
CREATE TABLE IF NOT EXISTS webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text UNIQUE NOT NULL,
  event_type text NOT NULL,
  customer_id text,
  subscription_id text,
  status text,
  processed_at timestamptz DEFAULT now(),
  raw_data jsonb,
  error_message text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON webhook_events(event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_customer_id ON webhook_events(customer_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed_at ON webhook_events(processed_at);

COMMENT ON TABLE webhook_events IS 'Audit log of all Stripe webhook events received';

-- Table to track subscription discrepancies
CREATE TABLE IF NOT EXISTS subscription_discrepancies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES members(id),
  stripe_customer_id text NOT NULL,
  db_status text NOT NULL,
  stripe_status text NOT NULL,
  detected_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  resolution_method text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_discrepancies_member_id ON subscription_discrepancies(member_id);
CREATE INDEX IF NOT EXISTS idx_discrepancies_customer_id ON subscription_discrepancies(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_discrepancies_unresolved ON subscription_discrepancies(resolved_at) WHERE resolved_at IS NULL;

COMMENT ON TABLE subscription_discrepancies IS 'Log of subscription status discrepancies between DB and Stripe';

-- Table to store sync reports from cron job
CREATE TABLE IF NOT EXISTS sync_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sync_reports_created_at ON sync_reports(created_at);

COMMENT ON TABLE sync_reports IS 'Reports from periodic subscription sync cron job';

-- 2. Add new fields to members table
-- ===================================================================

-- Add last_verified_at to track when subscription was last verified with Stripe
ALTER TABLE members ADD COLUMN IF NOT EXISTS last_verified_at timestamptz;

-- Add cancel_at_period_end to track if subscription will cancel at period end
ALTER TABLE members ADD COLUMN IF NOT EXISTS cancel_at_period_end boolean DEFAULT false;

-- Create index for last_verified_at to quickly find stale records
CREATE INDEX IF NOT EXISTS idx_members_last_verified_at ON members(last_verified_at);

COMMENT ON COLUMN members.last_verified_at IS 'Last time subscription status was verified with Stripe API';
COMMENT ON COLUMN members.cancel_at_period_end IS 'Whether subscription will cancel at end of current period';

-- 3. Drop legacy/unused tables (CAREFUL - review before running!)
-- ===================================================================

-- Uncomment these lines after verifying they are not needed:

-- DROP TABLE IF EXISTS board_position_history CASCADE;
-- DROP TABLE IF EXISTS board_position_responsibilities CASCADE;

-- Note: If these tables have data you want to preserve, 
-- export it first before dropping!

-- 4. Simplify views (optional - drop complex unused views)
-- ===================================================================

-- List of views to potentially drop (review and uncomment as needed):
-- DROP VIEW IF EXISTS member_search CASCADE;
-- DROP VIEW IF EXISTS member_stripe_data CASCADE;
-- DROP VIEW IF EXISTS expired_members CASCADE;

-- 5. Update RLS policies for new tables
-- ===================================================================

-- Enable RLS on new tables
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_discrepancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_reports ENABLE ROW LEVEL SECURITY;

-- Only service role can access these audit tables
CREATE POLICY "Service role only" ON webhook_events
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role only" ON subscription_discrepancies
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role only" ON sync_reports
  FOR ALL USING (auth.role() = 'service_role');

-- 6. Create helper functions for subscription management
-- ===================================================================

-- Function to update subscription status from webhook
CREATE OR REPLACE FUNCTION update_member_subscription_from_webhook(
  p_customer_id text,
  p_subscription_id text,
  p_status text,
  p_current_period_end bigint,
  p_cancel_at_period_end boolean DEFAULT false
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE members
  SET
    stripe_subscription_id = p_subscription_id,
    stripe_subscription_status = p_status,
    subscription_current_period_end = to_timestamp(p_current_period_end),
    cancel_at_period_end = p_cancel_at_period_end,
    last_verified_at = now(),
    updated_at = now()
  WHERE stripe_customer_id = p_customer_id;
  
  RETURN FOUND;
END;
$$;

COMMENT ON FUNCTION update_member_subscription_from_webhook IS 'Updates member subscription data from Stripe webhook';

-- 7. Add validation constraints
-- ===================================================================

-- Ensure subscription_status only contains valid Stripe statuses
ALTER TABLE members DROP CONSTRAINT IF EXISTS valid_subscription_status;
ALTER TABLE members ADD CONSTRAINT valid_subscription_status 
  CHECK (stripe_subscription_status IN ('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid') OR stripe_subscription_status IS NULL);

-- ===================================================================
-- Migration Complete
-- ===================================================================

-- To verify the migration was successful, run:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('webhook_events', 'subscription_discrepancies', 'sync_reports');


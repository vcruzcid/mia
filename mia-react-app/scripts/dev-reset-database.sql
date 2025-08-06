-- Development Database Reset Script
-- WARNING: This will delete ALL data in your development database
-- Only use this in development environment!

-- =============================================
-- DEVELOPMENT DATA RESET
-- =============================================

-- Disable triggers temporarily to avoid cascading issues
SET session_replication_role = replica;

-- Clear all data (in correct order due to foreign keys)
TRUNCATE TABLE member_activity CASCADE;
TRUNCATE TABLE member_categories CASCADE; 
TRUNCATE TABLE stripe_subscriptions CASCADE;
TRUNCATE TABLE stripe_customers CASCADE;
TRUNCATE TABLE members CASCADE;

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- Reset sequences if using serial columns
-- (Not needed for UUID primary keys)

-- Verify cleanup
SELECT 
  'members' as table_name, COUNT(*) as record_count FROM members
UNION ALL
SELECT 
  'member_categories' as table_name, COUNT(*) as record_count FROM member_categories
UNION ALL
SELECT 
  'member_activity' as table_name, COUNT(*) as record_count FROM member_activity
UNION ALL
SELECT 
  'stripe_customers' as table_name, COUNT(*) as record_count FROM stripe_customers
UNION ALL
SELECT 
  'stripe_subscriptions' as table_name, COUNT(*) as record_count FROM stripe_subscriptions;

-- Optional: Add back basic admin user
INSERT INTO members (
  first_name, last_name, email, membership_type, is_active, 
  main_profession, privacy_level, accepts_newsletter, gdpr_accepted
) VALUES 
  ('Dev', 'Admin', 'dev@admin.local', 'admin', true, 
   'Administrator', 'public', true, true)
ON CONFLICT (email) DO NOTHING;

SELECT '🗑️ Database reset completed for development' as status;
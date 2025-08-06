-- RLS Security Verification Script
-- Run this in Supabase SQL Editor AFTER importing data to verify security

-- 1. Check that RLS is enabled on all critical tables
SELECT 
  schemaname, 
  tablename, 
  rowsecurity as rls_enabled,
  enablerls
FROM pg_tables 
LEFT JOIN pg_class ON pg_class.relname = pg_tables.tablename
WHERE schemaname = 'public' 
AND tablename IN ('members', 'member_activity', 'stripe_customers', 'stripe_subscriptions')
ORDER BY tablename;

-- 2. List all RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. Test member privacy - this should only return public members
SELECT 
  COUNT(*) as public_members_count,
  COUNT(CASE WHEN privacy_level != 'public' THEN 1 END) as private_members_visible
FROM members;

-- 4. Check authentication functions exist
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('get_member_by_email', 'update_member_last_login')
ORDER BY routine_name;

-- 5. Verify public_members view exists and works
SELECT COUNT(*) as public_view_count FROM public_members;

-- 6. Test board_members view
SELECT COUNT(*) as board_members_count FROM board_members;

-- Expected Results:
-- 1. All tables should have rls_enabled=true
-- 2. Should see policies for public access, member self-access
-- 3. private_members_visible should be 0 (public queries can't see private data)
-- 4. Both auth functions should exist
-- 5. public_members should return only public profiles
-- 6. board_members should return 8 members
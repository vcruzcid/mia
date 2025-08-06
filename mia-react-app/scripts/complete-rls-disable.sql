-- Complete RLS bypass for import
-- Run this in your Supabase SQL Editor

-- Drop ALL policies on all tables
DROP POLICY IF EXISTS "Allow all during import" ON members;
DROP POLICY IF EXISTS "Allow all during import board" ON board_members;
DROP POLICY IF EXISTS "Allow all during import activity" ON member_activity;

-- Completely disable RLS
ALTER TABLE members DISABLE ROW LEVEL SECURITY;
ALTER TABLE board_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE member_activity DISABLE ROW LEVEL SECURITY;
ALTER TABLE public_members DISABLE ROW LEVEL SECURITY;

-- Ensure no policies exist
DO $$
BEGIN
    DROP POLICY IF EXISTS "Members can view their own profile" ON members;
    DROP POLICY IF EXISTS "Public can view public member info" ON members;
    DROP POLICY IF EXISTS "Members can update their own profile" ON members;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;
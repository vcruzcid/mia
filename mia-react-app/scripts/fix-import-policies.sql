-- Fix RLS policies for data import
-- Run this in your Supabase SQL Editor before importing data

-- Temporarily disable RLS for import
ALTER TABLE members DISABLE ROW LEVEL SECURITY;
ALTER TABLE board_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE member_activity DISABLE ROW LEVEL SECURITY;

-- Drop the problematic policies temporarily
DROP POLICY IF EXISTS "Members can view their own profile" ON members;
DROP POLICY IF EXISTS "Public can view public member info" ON members;
DROP POLICY IF EXISTS "Members can update their own profile" ON members;

-- Add simplified policies for import
CREATE POLICY "Allow all during import" ON members FOR ALL USING (true);
CREATE POLICY "Allow all during import board" ON board_members FOR ALL USING (true);
CREATE POLICY "Allow all during import activity" ON member_activity FOR ALL USING (true);

-- Note: After import, run the restore-policies.sql to restore proper security
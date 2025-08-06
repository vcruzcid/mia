-- Restore proper RLS policies after import
-- Run this in your Supabase SQL Editor after importing data

-- Remove temporary policies
DROP POLICY IF EXISTS "Allow all during import" ON members;
DROP POLICY IF EXISTS "Allow all during import board" ON board_members;
DROP POLICY IF EXISTS "Allow all during import activity" ON member_activity;

-- Restore proper RLS policies
CREATE POLICY "Public can view public member info" ON members 
  FOR SELECT USING (privacy_level = 'public');

CREATE POLICY "Members can view their own profile" ON members 
  FOR SELECT USING (auth.uid()::text = auth_user_id);

CREATE POLICY "Members can update their own profile" ON members 
  FOR UPDATE USING (auth.uid()::text = auth_user_id);

-- Board members policies
CREATE POLICY "Public can view board members" ON board_members 
  FOR SELECT USING (true);

-- Member activity policies
CREATE POLICY "Members can view their own activity" ON member_activity 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM members 
      WHERE members.id = member_activity.member_id 
      AND members.auth_user_id = auth.uid()::text
    )
  );

CREATE POLICY "Members can insert their own activity" ON member_activity 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM members 
      WHERE members.id = member_activity.member_id 
      AND members.auth_user_id = auth.uid()::text
    )
  );

-- Re-enable RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_activity ENABLE ROW LEVEL SECURITY;
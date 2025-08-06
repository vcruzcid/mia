-- Supabase Database Cleanup Script
-- Removes test data, duplicates, and optimizes database structure
-- Run this in Supabase SQL Editor

-- =============================================
-- 1. DATA CLEANUP
-- =============================================

-- Clean up obviously fake test data (keeping dev-friendly test accounts)
DELETE FROM members 
WHERE email IN ('test@example.com', 'fake@fake.com', 'invalid@invalid.com')
   OR (first_name = 'Test' AND last_name = 'Test');

-- Clean up empty or invalid member records
DELETE FROM members 
WHERE email IS NULL 
   OR email = '' 
   OR first_name IS NULL 
   OR first_name = '' 
   OR last_name IS NULL 
   OR last_name = '';

-- Remove duplicate members based on email (keep most recent)
DELETE FROM members m1 
WHERE EXISTS (
    SELECT 1 FROM members m2 
    WHERE m2.email = m1.email 
    AND m2.created_at > m1.created_at
);

-- Clean up orphaned categories
DELETE FROM member_categories 
WHERE member_id NOT IN (SELECT id FROM members);

-- Clean up orphaned activity logs
DELETE FROM member_activity 
WHERE member_id NOT IN (SELECT id FROM members);

-- Clean up orphaned stripe data
DELETE FROM stripe_customers 
WHERE member_id NOT IN (SELECT id FROM members);

DELETE FROM stripe_subscriptions 
WHERE member_id NOT IN (SELECT id FROM members);

-- =============================================
-- 2. DATA STANDARDIZATION
-- =============================================

-- Standardize country field
UPDATE members 
SET country = 'España' 
WHERE country IS NULL OR country = '' OR country IN ('Spain', 'spain', 'ES', 'es');

-- Standardize privacy levels
UPDATE members 
SET privacy_level = 'public' 
WHERE privacy_level IS NULL OR privacy_level NOT IN ('public', 'members-only', 'private');

-- Ensure active status is set
UPDATE members 
SET is_active = true 
WHERE is_active IS NULL;

-- Set default GDPR acceptance for existing members
UPDATE members 
SET gdpr_accepted = true 
WHERE gdpr_accepted IS NULL;

-- Clean up social media JSON - remove empty/null values
UPDATE members 
SET social_media = '{}'::jsonb
WHERE social_media IS NULL OR social_media = 'null'::jsonb;

-- =============================================
-- 4. FIX ENCODED CHARACTERS
-- =============================================

-- Fix HTML entities and common WordPress encoded characters in text fields
-- These are common issues from WordPress to Supabase migration

-- Fix first names with encoded characters
UPDATE members 
SET first_name = REPLACE(
  REPLACE(
    REPLACE(
      REPLACE(
        REPLACE(
          REPLACE(
            REPLACE(
              REPLACE(
                REPLACE(
                  REPLACE(first_name, '&amp;', '&'),
                  '&lt;', '<'),
                '&gt;', '>'),
              '&quot;', '"'),
            '&#039;', ''''),
          '&#8217;', ''''),
        '&#8216;', ''''),
      '&#8220;', '"'),
    '&#8221;', '"'),
  '&nbsp;', ' ')
WHERE first_name ~ '&[a-zA-Z0-9#]+;';

-- Fix last names with encoded characters
UPDATE members 
SET last_name = REPLACE(
  REPLACE(
    REPLACE(
      REPLACE(
        REPLACE(
          REPLACE(
            REPLACE(
              REPLACE(
                REPLACE(
                  REPLACE(last_name, '&amp;', '&'),
                  '&lt;', '<'),
                '&gt;', '>'),
              '&quot;', '"'),
            '&#039;', ''''),
          '&#8217;', ''''),
        '&#8216;', ''''),
      '&#8220;', '"'),
    '&#8221;', '"'),
  '&nbsp;', ' ')
WHERE last_name ~ '&[a-zA-Z0-9#]+;';

-- Fix Spanish accented characters in names
UPDATE members 
SET first_name = REPLACE(
  REPLACE(
    REPLACE(
      REPLACE(
        REPLACE(
          REPLACE(
            REPLACE(
              REPLACE(
                REPLACE(
                  REPLACE(
                    REPLACE(
                      REPLACE(first_name, '&aacute;', 'á'),
                      '&eacute;', 'é'),
                    '&iacute;', 'í'),
                  '&oacute;', 'ó'),
                '&uacute;', 'ú'),
              '&Aacute;', 'Á'),
            '&Eacute;', 'É'),
          '&Iacute;', 'Í'),
        '&Oacute;', 'Ó'),
      '&Uacute;', 'Ú'),
    '&ntilde;', 'ñ'),
  '&Ntilde;', 'Ñ')
WHERE first_name ~ '&[aeiouAEIOU]acute;|&[nN]tilde;';

UPDATE members 
SET last_name = REPLACE(
  REPLACE(
    REPLACE(
      REPLACE(
        REPLACE(
          REPLACE(
            REPLACE(
              REPLACE(
                REPLACE(
                  REPLACE(
                    REPLACE(
                      REPLACE(last_name, '&aacute;', 'á'),
                      '&eacute;', 'é'),
                    '&iacute;', 'í'),
                  '&oacute;', 'ó'),
                '&uacute;', 'ú'),
              '&Aacute;', 'Á'),
            '&Eacute;', 'É'),
          '&Iacute;', 'Í'),
        '&Oacute;', 'Ó'),
      '&Uacute;', 'Ú'),
    '&ntilde;', 'ñ'),
  '&Ntilde;', 'Ñ')
WHERE last_name ~ '&[aeiouAEIOU]acute;|&[nN]tilde;';

-- Fix company names with encoded characters
UPDATE members 
SET company = REPLACE(
  REPLACE(
    REPLACE(
      REPLACE(
        REPLACE(
          REPLACE(
            REPLACE(
              REPLACE(
                REPLACE(
                  REPLACE(
                    REPLACE(
                      REPLACE(
                        REPLACE(
                          REPLACE(
                            REPLACE(
                              REPLACE(company, '&amp;', '&'),
                              '&lt;', '<'),
                            '&gt;', '>'),
                          '&quot;', '"'),
                        '&#039;', ''''),
                      '&#8217;', ''''),
                    '&#8216;', ''''),
                  '&#8220;', '"'),
                '&#8221;', '"'),
              '&nbsp;', ' '),
            '&aacute;', 'á'),
          '&eacute;', 'é'),
        '&iacute;', 'í'),
      '&oacute;', 'ó'),
    '&uacute;', 'ú'),
  '&ntilde;', 'ñ')
WHERE company IS NOT NULL AND company ~ '&[a-zA-Z0-9#]+;';

-- Fix main_profession with encoded characters
UPDATE members 
SET main_profession = REPLACE(
  REPLACE(
    REPLACE(
      REPLACE(
        REPLACE(
          REPLACE(
            REPLACE(
              REPLACE(
                REPLACE(
                  REPLACE(
                    REPLACE(
                      REPLACE(
                        REPLACE(
                          REPLACE(
                            REPLACE(
                              REPLACE(main_profession, '&amp;', '&'),
                              '&lt;', '<'),
                            '&gt;', '>'),
                          '&quot;', '"'),
                        '&#039;', ''''),
                      '&#8217;', ''''),
                    '&#8216;', ''''),
                  '&#8220;', '"'),
                '&#8221;', '"'),
              '&nbsp;', ' '),
            '&aacute;', 'á'),
          '&eacute;', 'é'),
        '&iacute;', 'í'),
      '&oacute;', 'ó'),
    '&uacute;', 'ú'),
  '&ntilde;', 'ñ')
WHERE main_profession IS NOT NULL AND main_profession ~ '&[a-zA-Z0-9#]+;';

-- Fix bio field with encoded characters  
UPDATE members 
SET bio = REPLACE(
  REPLACE(
    REPLACE(
      REPLACE(
        REPLACE(
          REPLACE(
            REPLACE(
              REPLACE(
                REPLACE(
                  REPLACE(
                    REPLACE(
                      REPLACE(
                        REPLACE(
                          REPLACE(
                            REPLACE(
                              REPLACE(bio, '&amp;', '&'),
                              '&lt;', '<'),
                            '&gt;', '>'),
                          '&quot;', '"'),
                        '&#039;', ''''),
                      '&#8217;', ''''),
                    '&#8216;', ''''),
                  '&#8220;', '"'),
                '&#8221;', '"'),
              '&nbsp;', ' '),
            '&aacute;', 'á'),
          '&eacute;', 'é'),
        '&iacute;', 'í'),
      '&oacute;', 'ó'),
    '&uacute;', 'ú'),
  '&ntilde;', 'ñ')
WHERE bio IS NOT NULL AND bio ~ '&[a-zA-Z0-9#]+;';

-- Fix location fields with encoded characters
UPDATE members 
SET city = REPLACE(
  REPLACE(
    REPLACE(
      REPLACE(
        REPLACE(
          REPLACE(
            REPLACE(
              REPLACE(
                REPLACE(
                  REPLACE(
                    REPLACE(
                      REPLACE(city, '&amp;', '&'),
                      '&lt;', '<'),
                    '&gt;', '>'),
                  '&quot;', '"'),
                '&#039;', ''''),
              '&#8217;', ''''),
            '&#8216;', ''''),
          '&#8220;', '"'),
        '&#8221;', '"'),
      '&nbsp;', ' '),
    '&aacute;', 'á'),
  '&eacute;', 'é')
WHERE city IS NOT NULL AND city ~ '&[a-zA-Z0-9#]+;';

UPDATE members 
SET province = REPLACE(
  REPLACE(
    REPLACE(
      REPLACE(
        REPLACE(
          REPLACE(
            REPLACE(
              REPLACE(
                REPLACE(
                  REPLACE(
                    REPLACE(
                      REPLACE(province, '&amp;', '&'),
                      '&lt;', '<'),
                    '&gt;', '>'),
                  '&quot;', '"'),
                '&#039;', ''''),
              '&#8217;', ''''),
            '&#8216;', ''''),
          '&#8220;', '"'),
        '&#8221;', '"'),
      '&nbsp;', ' '),
    '&aacute;', 'á'),
  '&oacute;', 'ó')
WHERE province IS NOT NULL AND province ~ '&[a-zA-Z0-9#]+;';

-- Fix numeric character references (&#xxx;) - common for special characters
UPDATE members 
SET first_name = regexp_replace(first_name, '&#(\d+);', chr(cast('\1' as integer)), 'g')
WHERE first_name ~ '&#\d+;';

UPDATE members 
SET last_name = regexp_replace(last_name, '&#(\d+);', chr(cast('\1' as integer)), 'g')
WHERE last_name ~ '&#\d+;';

UPDATE members 
SET company = regexp_replace(company, '&#(\d+);', chr(cast('\1' as integer)), 'g')
WHERE company IS NOT NULL AND company ~ '&#\d+;';

UPDATE members 
SET bio = regexp_replace(bio, '&#(\d+);', chr(cast('\1' as integer)), 'g')
WHERE bio IS NOT NULL AND bio ~ '&#\d+;';

-- =============================================
-- 5. SCHEMA OPTIMIZATION
-- =============================================

-- Add flexible constraints for development (can be tightened later)
-- Note: These are dev-friendly constraints - adjust for production

-- Basic email format check (allows test emails)
ALTER TABLE members 
ADD CONSTRAINT IF NOT EXISTS check_email_basic 
CHECK (email ~ '@' OR email IS NULL);

-- Privacy level validation (with NULL allowed for flexibility)
ALTER TABLE members 
ADD CONSTRAINT IF NOT EXISTS check_privacy_level 
CHECK (privacy_level IN ('public', 'members-only', 'private') OR privacy_level IS NULL);

-- Membership type validation (flexible for dev)
-- Uncomment and adjust for production:
-- ALTER TABLE members 
-- ADD CONSTRAINT check_membership_type 
-- CHECK (membership_type IN ('socia-de-pleno-derecho', 'estudiante', 'colaboradora', 'admin'));

-- Add performance indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_members_created_at ON members(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_members_updated_at ON members(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_members_last_login ON members(last_login DESC);
CREATE INDEX IF NOT EXISTS idx_member_activity_created_at ON member_activity(created_at DESC);

-- =============================================
-- 6. CLEANUP STATISTICS
-- =============================================

-- View cleanup results
SELECT 
    'Members' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_members,
    COUNT(CASE WHEN is_board_member = true THEN 1 END) as board_members,
    COUNT(CASE WHEN privacy_level = 'public' THEN 1 END) as public_members
FROM members

UNION ALL

SELECT 
    'Member Categories' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT member_id) as members_with_categories,
    0 as active_members,
    0 as board_members
FROM member_categories

UNION ALL

SELECT 
    'Member Activity' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT member_id) as members_with_activity,
    0 as active_members,
    0 as board_members
FROM member_activity

UNION ALL

SELECT 
    'Stripe Customers' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT member_id) as members_with_stripe,
    0 as active_members,
    0 as board_members
FROM stripe_customers;

-- Check for any remaining data quality issues
SELECT 
    'Data Quality Check' as check_type,
    COUNT(CASE WHEN email IS NULL OR email = '' THEN 1 END) as invalid_emails,
    COUNT(CASE WHEN first_name IS NULL OR first_name = '' THEN 1 END) as missing_first_names,
    COUNT(CASE WHEN last_name IS NULL OR last_name = '' THEN 1 END) as missing_last_names,
    COUNT(CASE WHEN privacy_level NOT IN ('public', 'members-only', 'private') THEN 1 END) as invalid_privacy_levels
FROM members;

-- Check for remaining encoded characters after cleanup
SELECT 
    'Encoding Check' as check_type,
    COUNT(CASE WHEN first_name ~ '&[a-zA-Z0-9#]+;' THEN 1 END) as first_name_encoded,
    COUNT(CASE WHEN last_name ~ '&[a-zA-Z0-9#]+;' THEN 1 END) as last_name_encoded,
    COUNT(CASE WHEN company ~ '&[a-zA-Z0-9#]+;' THEN 1 END) as company_encoded,
    COUNT(CASE WHEN bio ~ '&[a-zA-Z0-9#]+;' THEN 1 END) as bio_encoded,
    COUNT(CASE WHEN city ~ '&[a-zA-Z0-9#]+;' THEN 1 END) as city_encoded,
    COUNT(CASE WHEN province ~ '&[a-zA-Z0-9#]+;' THEN 1 END) as province_encoded
FROM members;
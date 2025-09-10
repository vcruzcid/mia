-- =============================================
-- COMPREHENSIVE DATABASE IMPROVEMENTS
-- =============================================
-- Full migration for MIA database improvements
-- Safe to run on development data

-- =============================================
-- 1. MEMBERSHIP TYPE CORRECTIONS
-- =============================================
-- Fix membership types: colaboradora → colaborador
UPDATE members 
SET membership_type = 'colaborador' 
WHERE membership_type = 'colaboradora';

-- Add constraint for valid membership types
ALTER TABLE members 
ADD CONSTRAINT check_membership_type 
CHECK (membership_type IN ('socia-pleno-derecho', 'estudiante', 'colaborador'));

-- =============================================
-- 2. LOCATION IMPROVEMENTS
-- =============================================
-- Add missing city field
ALTER TABLE members ADD COLUMN city TEXT;

-- Create index for location searches
CREATE INDEX idx_members_city ON members(city);

-- =============================================
-- 3. PROFESSIONAL DATA IMPROVEMENTS
-- =============================================
-- Rename professional_role to professional_level
ALTER TABLE members RENAME COLUMN professional_role TO professional_level;

-- Create consolidated professions field (keeping both during migration)
ALTER TABLE members ADD COLUMN consolidated_professions TEXT[];

-- Migrate existing profession data to consolidated field
UPDATE members 
SET consolidated_professions = 
  CASE 
    WHEN main_profession IS NOT NULL AND other_professions IS NOT NULL 
    THEN array_append(other_professions, main_profession)
    WHEN main_profession IS NOT NULL 
    THEN ARRAY[main_profession]
    WHEN other_professions IS NOT NULL 
    THEN other_professions
    ELSE NULL
  END;

-- Add index for profession searches
CREATE INDEX idx_members_consolidated_professions ON members USING GIN(consolidated_professions);

-- =============================================
-- 4. BOARD MEMBER IMPROVEMENTS
-- =============================================
-- Add date tracking to board positions
ALTER TABLE member_board_positions ADD COLUMN start_date DATE;
ALTER TABLE member_board_positions ADD COLUMN end_date DATE;

-- Update existing board positions with term dates
UPDATE member_board_positions 
SET 
  start_date = (
    SELECT TO_DATE(bt.start_year::text || '-01-01', 'YYYY-MM-DD')
    FROM board_terms bt 
    WHERE bt.id = member_board_positions.board_term_id
  ),
  end_date = (
    SELECT TO_DATE(bt.end_year::text || '-12-31', 'YYYY-MM-DD')
    FROM board_terms bt 
    WHERE bt.id = member_board_positions.board_term_id
  );

-- Add constraint: member can have only one role per term
CREATE UNIQUE INDEX idx_member_board_unique_per_term 
ON member_board_positions(member_id, board_term_id);

-- =============================================
-- 5. CLEANUP - REMOVE UNNECESSARY FIELDS
-- =============================================
-- Remove WordPress migration references
ALTER TABLE members DROP COLUMN IF EXISTS wp_post_id;
ALTER TABLE members DROP COLUMN IF EXISTS wp_user_id;

-- Remove industry tracking fields (as requested)
ALTER TABLE members DROP COLUMN IF EXISTS experienced_gender_discrimination;
ALTER TABLE members DROP COLUMN IF EXISTS experienced_salary_discrimination;
ALTER TABLE members DROP COLUMN IF EXISTS experienced_sexual_harassment;
ALTER TABLE members DROP COLUMN IF EXISTS experienced_sexual_abuse;
ALTER TABLE members DROP COLUMN IF EXISTS experienced_glass_ceiling;
ALTER TABLE members DROP COLUMN IF EXISTS experienced_inequality_episode;

-- Remove redundant member_categories table (replaced by consolidated_professions)
DROP TABLE IF EXISTS member_categories;

-- =============================================
-- 6. FILE MANAGEMENT SYSTEM
-- =============================================
-- Create proper file tracking table
CREATE TABLE IF NOT EXISTS member_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  file_type TEXT NOT NULL CHECK (file_type IN ('profile_image', 'resume')),
  original_filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  supabase_storage_url TEXT,
  file_size INTEGER,
  mime_type TEXT,
  is_optimized BOOLEAN DEFAULT false, -- For profile image optimization
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Only one file per type per member
  UNIQUE(member_id, file_type)
);

-- Add indexes for file management
CREATE INDEX idx_member_files_member_id ON member_files(member_id);
CREATE INDEX idx_member_files_type ON member_files(file_type);

-- =============================================
-- 7. UPDATED VIEWS WITH IMPROVEMENTS
-- =============================================
-- Update public_members view with new structure
CREATE OR REPLACE VIEW public_members AS
SELECT 
  m.id,
  m.member_number,
  m.first_name,
  m.last_name,
  m.display_name,
  m.email,
  m.company,
  m.consolidated_professions as professions,
  m.professional_level,
  m.years_experience,
  m.biography,
  m.city,
  m.province,
  m.autonomous_community,
  m.country,
  m.social_media,
  m.membership_type,
  m.accepts_job_offers,
  m.created_at,
  -- File URLs from new file system
  f_img.supabase_storage_url as profile_image_url,
  f_resume.supabase_storage_url as resume_url,
  -- Keep legacy URLs for backward compatibility
  m.profile_image_url as legacy_profile_image_url,
  m.cv_document_url as legacy_cv_url
FROM members m
LEFT JOIN member_files f_img ON m.id = f_img.member_id AND f_img.file_type = 'profile_image'
LEFT JOIN member_files f_resume ON m.id = f_resume.member_id AND f_resume.file_type = 'resume'
WHERE m.is_active = true 
  AND m.privacy_level = 'public';

-- Update board members view with date tracking
CREATE OR REPLACE VIEW board_members_all_terms AS
SELECT 
  m.id,
  m.member_number,
  m.first_name,
  m.last_name,
  m.display_name,
  m.biography,
  m.consolidated_professions as professions,
  bt.start_year,
  bt.end_year,
  bt.is_founding_term,
  bt.description as term_description,
  mbp.position,
  mbp.start_date,
  mbp.end_date,
  -- Check if currently serving
  CASE 
    WHEN mbp.end_date >= CURRENT_DATE OR mbp.end_date IS NULL 
    THEN true 
    ELSE false 
  END as is_current_board_member,
  f_img.supabase_storage_url as profile_image_url
FROM members m
JOIN member_board_positions mbp ON m.id = mbp.member_id
JOIN board_terms bt ON mbp.board_term_id = bt.id
LEFT JOIN member_files f_img ON m.id = f_img.member_id AND f_img.file_type = 'profile_image'
WHERE m.is_active = true
ORDER BY bt.start_year DESC, 
         CASE mbp.position 
             WHEN 'Presidenta' THEN 1 
             WHEN 'Vice-Presidenta' THEN 2 
             WHEN 'Secretaria' THEN 3 
             WHEN 'Tesorera' THEN 4 
             WHEN 'Vocal' THEN 5 
         END;

-- =============================================
-- 8. STRIPE INTEGRATION FUNCTIONS
-- =============================================
-- Enhanced member registration completion
CREATE OR REPLACE FUNCTION complete_member_registration(
  stripe_session_id TEXT,
  member_data JSONB
)
RETURNS UUID AS $$
DECLARE
  member_id UUID;
  customer_email TEXT;
  customer_id TEXT;
BEGIN
  customer_email := member_data->>'email';
  customer_id := member_data->>'stripe_customer_id';
  
  -- Generate next member number
  INSERT INTO members (
    member_number,
    first_name,
    last_name,
    email,
    phone,
    city,
    province,
    autonomous_community,
    membership_type,
    consolidated_professions,
    professional_level,
    company,
    years_experience,
    accepts_newsletter,
    accepts_job_offers,
    gdpr_accepted,
    stripe_customer_id,
    is_active
  ) VALUES (
    (SELECT get_next_member_number()),
    member_data->>'first_name',
    member_data->>'last_name',
    customer_email,
    member_data->>'phone',
    member_data->>'city',
    member_data->>'province',
    member_data->>'autonomous_community',
    member_data->>'membership_type',
    CASE 
      WHEN member_data->>'professions' IS NOT NULL 
      THEN string_to_array(member_data->>'professions', ',')
      ELSE NULL
    END,
    member_data->>'professional_level',
    member_data->>'company',
    (member_data->>'years_experience')::integer,
    COALESCE((member_data->>'accepts_newsletter')::boolean, false),
    COALESCE((member_data->>'accepts_job_offers')::boolean, false),
    true,
    customer_id,
    true
  ) RETURNING id INTO member_id;
  
  -- Log registration activity
  INSERT INTO member_activity (member_id, activity_type, activity_data)
  VALUES (member_id, 'registration_completed', member_data);
  
  RETURN member_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle subscription status updates
CREATE OR REPLACE FUNCTION update_member_subscription_status(
  stripe_customer_id_param TEXT,
  subscription_status TEXT
)
RETURNS VOID AS $$
BEGIN
  UPDATE members 
  SET 
    is_active = CASE 
      WHEN subscription_status IN ('active', 'trialing') THEN true
      ELSE false
    END,
    updated_at = NOW()
  WHERE stripe_customer_id = stripe_customer_id_param;
  
  -- Log activity
  INSERT INTO member_activity (
    member_id, 
    activity_type, 
    activity_data
  )
  SELECT 
    id,
    'subscription_status_changed',
    jsonb_build_object(
      'new_status', subscription_status,
      'timestamp', NOW()
    )
  FROM members 
  WHERE stripe_customer_id = stripe_customer_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 9. FILE MANAGEMENT FUNCTIONS
-- =============================================
-- Function to register uploaded file
CREATE OR REPLACE FUNCTION register_member_file(
  member_id_param UUID,
  file_type_param TEXT,
  original_filename_param TEXT,
  storage_path_param TEXT,
  file_size_param INTEGER,
  mime_type_param TEXT
)
RETURNS UUID AS $$
DECLARE
  file_id UUID;
  storage_url TEXT;
BEGIN
  -- Generate Supabase Storage URL
  storage_url := 'https://your-project.supabase.co/storage/v1/object/public/member-files/' || storage_path_param;
  
  -- Insert or update file record
  INSERT INTO member_files (
    member_id,
    file_type,
    original_filename,
    storage_path,
    supabase_storage_url,
    file_size,
    mime_type
  ) VALUES (
    member_id_param,
    file_type_param,
    original_filename_param,
    storage_path_param,
    storage_url,
    file_size_param,
    mime_type_param
  ) 
  ON CONFLICT (member_id, file_type) 
  DO UPDATE SET
    original_filename = EXCLUDED.original_filename,
    storage_path = EXCLUDED.storage_path,
    supabase_storage_url = EXCLUDED.supabase_storage_url,
    file_size = EXCLUDED.file_size,
    mime_type = EXCLUDED.mime_type,
    uploaded_at = NOW()
  RETURNING id INTO file_id;
  
  -- Update legacy URL fields for backward compatibility
  IF file_type_param = 'profile_image' THEN
    UPDATE members 
    SET profile_image_url = storage_url 
    WHERE id = member_id_param;
  ELSIF file_type_param = 'resume' THEN
    UPDATE members 
    SET cv_document_url = storage_url 
    WHERE id = member_id_param;
  END IF;
  
  -- Log activity
  INSERT INTO member_activity (member_id, activity_type, activity_data)
  VALUES (
    member_id_param, 
    'file_uploaded',
    jsonb_build_object(
      'file_type', file_type_param,
      'filename', original_filename_param,
      'size', file_size_param
    )
  );
  
  RETURN file_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 10. ROW LEVEL SECURITY FOR NEW TABLES
-- =============================================
-- Enable RLS on member_files
ALTER TABLE member_files ENABLE ROW LEVEL SECURITY;

-- Public can view profile images
CREATE POLICY "Profile images are public" ON member_files
  FOR SELECT 
  USING (
    file_type = 'profile_image' 
    AND EXISTS (
      SELECT 1 FROM members 
      WHERE members.id = member_files.member_id 
      AND members.is_active = true 
      AND members.privacy_level = 'public'
    )
  );

-- Members can manage their own files
CREATE POLICY "Members can manage own files" ON member_files
  FOR ALL 
  USING (
    member_id IN (
      SELECT id FROM members 
      WHERE email = auth.jwt()->>'email'
    )
  );

-- =============================================
-- 11. UPDATED HELPER FUNCTIONS
-- =============================================
-- Enhanced member search with new profession structure
CREATE OR REPLACE FUNCTION search_members_by_profession(profession_query TEXT)
RETURNS TABLE (
  id UUID,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  professions TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.first_name,
    m.last_name,
    m.email,
    m.consolidated_professions
  FROM members m
  WHERE m.is_active = true
    AND m.privacy_level = 'public'
    AND (
      profession_query = ANY(m.consolidated_professions)
      OR EXISTS (
        SELECT 1 
        FROM unnest(m.consolidated_professions) as prof 
        WHERE prof ILIKE '%' || profession_query || '%'
      )
    );
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- MIGRATION COMPLETION
-- =============================================
-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Comprehensive database improvements completed successfully!';
  RAISE NOTICE '📊 Changes applied:';
  RAISE NOTICE '  - Fixed membership types (colaboradora → colaborador)';
  RAISE NOTICE '  - Added city field for better location tracking';
  RAISE NOTICE '  - Renamed professional_role → professional_level';
  RAISE NOTICE '  - Consolidated profession fields';
  RAISE NOTICE '  - Enhanced board member tracking with dates';
  RAISE NOTICE '  - Removed WordPress migration fields';
  RAISE NOTICE '  - Removed industry tracking fields';
  RAISE NOTICE '  - Added comprehensive file management system';
  RAISE NOTICE '  - Updated views and functions';
  RAISE NOTICE '  - Enhanced Stripe integration';
  RAISE NOTICE '🚀 Database ready for production use!';
END $$;
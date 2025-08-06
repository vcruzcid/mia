-- Development Seed Data for Supabase
-- Use this to populate your dev database with test data
-- Only run this in development environment

-- =============================================
-- DEV TEST DATA
-- =============================================

-- Insert development test members (if they don't exist)
INSERT INTO members (
  first_name, last_name, email, membership_type, is_active, 
  main_profession, company, province, autonomous_community,
  privacy_level, accepts_newsletter, gdpr_accepted
) VALUES 
  -- Admin test account
  ('Admin', 'User', 'admin@dev.local', 'admin', true, 
   'Administrator', 'MIA Dev', 'Madrid', 'Madrid',
   'public', true, true),
   
  -- Regular member test accounts
  ('Ana', 'García', 'ana@dev.local', 'socia-de-pleno-derecho', true,
   'Animadora 3D', 'Studio Test', 'Barcelona', 'Cataluña',
   'public', true, true),
   
  ('Carlos', 'Rodríguez', 'carlos@dev.local', 'socia-de-pleno-derecho', true,
   'Director de Arte', 'Animation Dev', 'Valencia', 'Comunidad Valenciana',
   'public', false, true),
   
  ('María', 'López', 'maria@dev.local', 'estudiante', true,
   'Estudiante de Animación', 'Universidad Test', 'Sevilla', 'Andalucía',
   'members-only', true, true),
   
  -- Board member test account
  ('Elena', 'Martín', 'elena@dev.local', 'socia-de-pleno-derecho', true,
   'Productora', 'Board Test Co', 'Bilbao', 'País Vasco',
   'public', true, true),
   
  -- Inactive member for testing
  ('Test', 'Inactive', 'inactive@dev.local', 'colaboradora', false,
   'Freelancer', null, 'Granada', 'Andalucía',
   'private', false, true)

ON CONFLICT (email) DO NOTHING;

-- Update Elena as board member
UPDATE members 
SET is_board_member = true, board_position = 'Presidenta'
WHERE email = 'elena@dev.local';

-- =============================================
-- DEV MEMBER CATEGORIES
-- =============================================

-- Add categories for test members
INSERT INTO member_categories (member_id, category_type, category_name, category_slug, is_primary)
SELECT 
  m.id,
  'profession',
  m.main_profession,
  lower(replace(m.main_profession, ' ', '-')),
  true
FROM members m
WHERE m.email LIKE '%@dev.local' 
  AND m.main_profession IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM member_categories mc 
    WHERE mc.member_id = m.id AND mc.category_type = 'profession'
  );

-- Add board role category
INSERT INTO member_categories (member_id, category_type, category_name, category_slug, is_primary)
SELECT 
  m.id,
  'board_role',
  m.board_position,
  lower(replace(m.board_position, ' ', '-')),
  true
FROM members m
WHERE m.email = 'elena@dev.local' 
  AND m.board_position IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM member_categories mc 
    WHERE mc.member_id = m.id AND mc.category_type = 'board_role'
  );

-- =============================================
-- DEV ACTIVITY LOGS
-- =============================================

-- Add some test activity for dev accounts
INSERT INTO member_activity (member_id, activity_type, activity_data)
SELECT 
  m.id,
  'registration',
  jsonb_build_object(
    'timestamp', NOW(),
    'source', 'dev_seed',
    'ip_address', '127.0.0.1'
  )
FROM members m
WHERE m.email LIKE '%@dev.local'
  AND NOT EXISTS (
    SELECT 1 FROM member_activity ma 
    WHERE ma.member_id = m.id AND ma.activity_type = 'registration'
  );

-- Add login activities
INSERT INTO member_activity (member_id, activity_type, activity_data)
SELECT 
  m.id,
  'login',
  jsonb_build_object(
    'timestamp', NOW() - INTERVAL '1 day',
    'source', 'dev_test'
  )
FROM members m
WHERE m.email IN ('admin@dev.local', 'ana@dev.local', 'elena@dev.local')
  AND m.is_active = true;

-- =============================================
-- VERIFICATION QUERY
-- =============================================

-- Check what was created
SELECT 
  'Development seed data summary:' as info,
  COUNT(*) as dev_members_created
FROM members 
WHERE email LIKE '%@dev.local';

SELECT 
  first_name || ' ' || last_name as name,
  email,
  membership_type,
  is_board_member,
  is_active,
  main_profession
FROM members 
WHERE email LIKE '%@dev.local'
ORDER BY created_at DESC;

-- Show categories created
SELECT 
  m.first_name || ' ' || m.last_name as member_name,
  mc.category_type,
  mc.category_name
FROM members m
JOIN member_categories mc ON m.id = mc.member_id
WHERE m.email LIKE '%@dev.local'
ORDER BY m.first_name, mc.category_type;
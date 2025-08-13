-- =====================================
-- SIMPLIFIED SUPPORTING TABLES FOR WEB-MIA
-- =====================================
-- This adds only the essential tables needed for the new website
-- Keeps existing members table structure (it's perfect as-is)

-- ====================================
-- 1. PROFESSION CATEGORIES
-- ====================================
-- For filtering in the Socias gallery

CREATE TABLE IF NOT EXISTS profession_categories (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    display_order INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert the 35 specific animation industry categories
INSERT INTO profession_categories (name, display_order) VALUES
('Guión', 1),
('Dirección', 2),
('Storyboard', 3),
('Dirección de arte', 4),
('Concept Art', 5),
('Diseño de personajes', 6),
('Diseño de sets', 7),
('Visual Development', 8),
('Modelado 3D', 9),
('Motion Graphics', 10),
('Layout 2D', 11),
('Layout 3D', 12),
('Color BG', 13),
('Rigging 2D', 14),
('Rigging 3D', 15),
('Animación 2D', 16),
('2D FX', 17),
('Clean Up', 18),
('Ink and Paint', 19),
('Animación 3D', 20),
('Animación StopMotion', 21),
('Artista para Stopmotion', 22),
('Composición Digital', 23),
('Sonido/ Música/ SFX', 24),
('Montaje', 25),
('Pipeline', 26),
('Producción', 27),
('Asistente de producción', 28),
('Directora de producción', 29),
('Coordinadora de producción', 30),
('Line producer', 31),
('Producción ejecutiva', 32),
('Matte painting', 33),
('Render wrangler', 34),
('Lighting', 35),
('Shading', 36),
('Marketing', 37),
('Groom artist', 38),
('Compositora musical', 39),
('Other', 999);

-- ====================================
-- 2. BOARD TERMS & POSITIONS
-- ====================================
-- Track Directiva members across different terms

CREATE TABLE IF NOT EXISTS board_terms (
    id SERIAL PRIMARY KEY,
    start_year INTEGER NOT NULL,
    end_year INTEGER NOT NULL,
    is_founding_term BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(start_year, end_year)
);

-- Insert the board terms
INSERT INTO board_terms (start_year, end_year, is_founding_term, description) VALUES
(2018, 2018, true, 'Fundadoras - Founding Board'),
(2019, 2021, false, 'Directiva 2019-2021'),
(2021, 2023, false, 'Directiva 2021-2023'),
(2023, 2025, false, 'Directiva 2023-2025'),
(2025, 2027, false, 'Directiva Actual 2025-2027');

CREATE TABLE IF NOT EXISTS member_board_positions (
    id SERIAL PRIMARY KEY,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    board_term_id INTEGER REFERENCES board_terms(id) ON DELETE CASCADE,
    position TEXT NOT NULL CHECK (position IN ('Presidenta', 'Vice-Presidenta', 'Secretaria', 'Tesorera', 'Vocal')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(member_id, board_term_id)
);

-- ====================================
-- 3. MEMBER FILES
-- ====================================
-- Track profile images and resume PDFs

CREATE TABLE IF NOT EXISTS member_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    file_type TEXT NOT NULL CHECK (file_type IN ('profile_image', 'resume')),
    original_filename TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    migrated_from_wordpress BOOLEAN DEFAULT false,
    wordpress_url TEXT,
    
    -- Only one profile image and one resume per member
    UNIQUE(member_id, file_type)
);

-- ====================================
-- 4. INDEXES FOR PERFORMANCE
-- ====================================

CREATE INDEX idx_profession_categories_display_order ON profession_categories(display_order);
CREATE INDEX idx_board_terms_years ON board_terms(start_year, end_year);
CREATE INDEX idx_member_board_positions_member_id ON member_board_positions(member_id);
CREATE INDEX idx_member_board_positions_term_id ON member_board_positions(board_term_id);
CREATE INDEX idx_member_files_member_id ON member_files(member_id);
CREATE INDEX idx_member_files_type ON member_files(file_type);

-- ====================================
-- 5. VIEWS FOR EASY QUERYING
-- ====================================

-- View for active members with public profiles (for Socias gallery)
CREATE OR REPLACE VIEW public_members AS
SELECT 
    m.id,
    m.member_number,
    m.first_name,
    m.last_name,
    m.display_name,
    m.biography,
    m.main_profession,
    m.other_professions,
    m.company,
    m.country,
    m.province,
    m.profile_image_url,
    m.social_media,
    m.accepts_job_offers,
    f_img.storage_path as profile_image_path,
    f_resume.storage_path as resume_path
FROM members m
LEFT JOIN member_files f_img ON m.id = f_img.member_id AND f_img.file_type = 'profile_image'
LEFT JOIN member_files f_resume ON m.id = f_resume.member_id AND f_resume.file_type = 'resume'
WHERE m.is_active = true 
  AND m.privacy_level = 'public';

-- View for board members across all terms
CREATE OR REPLACE VIEW board_members_all_terms AS
SELECT 
    m.id,
    m.member_number,
    m.first_name,
    m.last_name,
    m.display_name,
    m.biography,
    m.profile_image_url,
    bt.start_year,
    bt.end_year,
    bt.is_founding_term,
    bt.description as term_description,
    mbp.position,
    f_img.storage_path as profile_image_path
FROM members m
JOIN member_board_positions mbp ON m.id = mbp.member_id
JOIN board_terms bt ON mbp.board_term_id = bt.id
LEFT JOIN member_files f_img ON m.id = f_img.member_id AND f_img.file_type = 'profile_image'
ORDER BY bt.start_year DESC, 
         CASE mbp.position 
             WHEN 'Presidenta' THEN 1 
             WHEN 'Vice-Presidenta' THEN 2 
             WHEN 'Secretaria' THEN 3 
             WHEN 'Tesorera' THEN 4 
             WHEN 'Vocal' THEN 5 
         END;

-- View for current board (2025-2027)
CREATE OR REPLACE VIEW current_board AS
SELECT *
FROM board_members_all_terms
WHERE start_year = 2025 AND end_year = 2027;

-- View for founding members (2018)
CREATE OR REPLACE VIEW founding_members AS
SELECT *
FROM board_members_all_terms
WHERE is_founding_term = true;

-- ====================================
-- 6. HELPER FUNCTIONS
-- ====================================

-- Function to get next member number for new registrations
CREATE OR REPLACE FUNCTION get_next_member_number()
RETURNS INTEGER AS $$
DECLARE
    next_number INTEGER;
BEGIN
    SELECT COALESCE(MAX(member_number), 0) + 1 INTO next_number
    FROM members
    WHERE member_number IS NOT NULL;
    
    RETURN next_number;
END;
$$ LANGUAGE plpgsql;

-- Function to check if member has specific profession
CREATE OR REPLACE FUNCTION member_has_profession(member_uuid UUID, profession_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM members 
        WHERE id = member_uuid 
        AND (
            main_profession = profession_name 
            OR profession_name = ANY(other_professions)
        )
    );
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- 7. ROW LEVEL SECURITY
-- ====================================

-- Enable RLS on new tables
ALTER TABLE member_board_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_files ENABLE ROW LEVEL SECURITY;

-- Board positions are public (for Directiva pages)
CREATE POLICY "Board positions are public" ON member_board_positions
    FOR SELECT USING (true);

-- Board positions can only be managed by admins
CREATE POLICY "Only admins can manage board positions" ON member_board_positions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM members 
            WHERE members.id = auth.uid()::uuid 
            AND members.membership_type = 'admin'
        )
    );

-- Member files visibility
CREATE POLICY "Members can view public member files" ON member_files
    FOR SELECT USING (
        file_type = 'profile_image' 
        OR EXISTS (
            SELECT 1 FROM members 
            WHERE members.id = member_files.member_id 
            AND members.privacy_level = 'public'
        )
    );

-- Members can manage their own files
CREATE POLICY "Members can manage their own files" ON member_files
    FOR ALL USING (
        member_id = auth.uid()::uuid
    );

-- ====================================
-- 8. COMMENTS FOR DOCUMENTATION
-- ====================================

COMMENT ON TABLE profession_categories IS 'Animation industry profession categories for filtering';
COMMENT ON TABLE board_terms IS 'Directiva terms and founding period tracking';
COMMENT ON TABLE member_board_positions IS 'Junction table for member board positions across terms';
COMMENT ON TABLE member_files IS 'Profile images and resume files for members';

COMMENT ON VIEW public_members IS 'Active members with public profiles for Socias gallery';
COMMENT ON VIEW board_members_all_terms IS 'All board members across all terms';
COMMENT ON VIEW current_board IS 'Current board members (2025-2027)';
COMMENT ON VIEW founding_members IS 'Founding board members (2018)';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Web-MIA supporting tables created successfully!';
    RAISE NOTICE 'Added: profession_categories (% entries), board_terms (% terms), member_board_positions, member_files',
        (SELECT COUNT(*) FROM profession_categories),
        (SELECT COUNT(*) FROM board_terms);
    RAISE NOTICE 'Views created: public_members, board_members_all_terms, current_board, founding_members';
    RAISE NOTICE 'Helper functions: get_next_member_number(), member_has_profession()';
    RAISE NOTICE 'Ready for Web-MIA implementation!';
END $$;
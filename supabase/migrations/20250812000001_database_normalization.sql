-- Database Normalization Migration
-- Normalizes geographic data, professions, membership types, education, and salary ranges

BEGIN;

-- ====================================
-- 1. GEOGRAPHIC DATA NORMALIZATION
-- ====================================

-- Countries table
CREATE TABLE countries (
    id SERIAL PRIMARY KEY,
    code VARCHAR(2) UNIQUE NOT NULL,
    name TEXT NOT NULL,
    name_es TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Autonomous communities table (Spain-specific)
CREATE TABLE autonomous_communities (
    id SERIAL PRIMARY KEY,
    country_id INTEGER REFERENCES countries(id) ON DELETE CASCADE,
    code VARCHAR(10),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(country_id, code)
);

-- Provinces table
CREATE TABLE provinces (
    id SERIAL PRIMARY KEY,
    autonomous_community_id INTEGER REFERENCES autonomous_communities(id) ON DELETE CASCADE,
    country_id INTEGER REFERENCES countries(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(autonomous_community_id, name)
);

-- Insert countries from existing member data
INSERT INTO countries (code, name, name_es) VALUES
('ES', 'Spain', 'España'),
('MX', 'Mexico', 'México'),
('CO', 'Colombia', 'Colombia'),
('CH', 'Switzerland', 'Suiza'),
('BR', 'Brazil', 'Brasil'),
('US', 'United States', 'Estados Unidos'),
('CL', 'Chile', 'Chile'),
('PT', 'Portugal', 'Portugal'),
('DO', 'Dominican Republic', 'República Dominicana');

-- Spanish Autonomous Communities (for ES members)
INSERT INTO autonomous_communities (country_id, code, name) 
SELECT c.id, ac.code, ac.name FROM countries c
CROSS JOIN (VALUES 
    ('AN', 'Andalucía'),
    ('AR', 'Aragón'),
    ('AS', 'Asturias'),
    ('IB', 'Islas Baleares'),
    ('CN', 'Canarias'),
    ('CB', 'Cantabria'),
    ('CM', 'Castilla-La Mancha'),
    ('CL', 'Castilla y León'),
    ('CT', 'Cataluña'),
    ('EX', 'Extremadura'),
    ('GA', 'Galicia'),
    ('MD', 'Madrid'),
    ('MC', 'Murcia'),
    ('NC', 'Navarra'),
    ('PV', 'País Vasco'),
    ('RI', 'La Rioja'),
    ('VC', 'Valencia'),
    ('CE', 'Ceuta'),
    ('ML', 'Melilla')
) AS ac(code, name)
WHERE c.code = 'ES';

-- ====================================
-- 2. PROFESSION NORMALIZATION
-- ====================================

-- Profession categories
CREATE TABLE profession_categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Professions table
CREATE TABLE professions (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    category_id INTEGER REFERENCES profession_categories(id),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Member profession relationships (many-to-many)
CREATE TABLE member_professions (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    profession_id INTEGER REFERENCES professions(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    years_experience INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(member_id, profession_id)
);

-- Companies table
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    industry TEXT,
    size_category TEXT,
    website TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(name)
);

-- Insert profession categories
INSERT INTO profession_categories (name, description) VALUES
('Animation & VFX', 'Animation, Visual Effects, and Digital Arts'),
('Film & TV', 'Film and Television Production'),
('Games', 'Video Game Development and Design'),
('Design', 'Graphic Design, UI/UX, and Visual Design'),
('Technology', 'Software Development and Technical Roles'),
('Education', 'Teaching and Educational Roles'),
('Management', 'Project Management and Business Management'),
('Art', 'Traditional and Digital Art'),
('Audio', 'Sound Design and Audio Production'),
('Other', 'Other Professional Areas');

-- Common professions in animation/media industry
INSERT INTO professions (name, category_id) VALUES
-- Animation & VFX
('Animator', (SELECT id FROM profession_categories WHERE name = 'Animation & VFX')),
('3D Artist', (SELECT id FROM profession_categories WHERE name = 'Animation & VFX')),
('2D Artist', (SELECT id FROM profession_categories WHERE name = 'Animation & VFX')),
('VFX Artist', (SELECT id FROM profession_categories WHERE name = 'Animation & VFX')),
('Character Designer', (SELECT id FROM profession_categories WHERE name = 'Animation & VFX')),
('Storyboard Artist', (SELECT id FROM profession_categories WHERE name = 'Animation & VFX')),
('Motion Graphics Designer', (SELECT id FROM profession_categories WHERE name = 'Animation & VFX')),
-- Film & TV
('Director', (SELECT id FROM profession_categories WHERE name = 'Film & TV')),
('Producer', (SELECT id FROM profession_categories WHERE name = 'Film & TV')),
('Editor', (SELECT id FROM profession_categories WHERE name = 'Film & TV')),
('Cinematographer', (SELECT id FROM profession_categories WHERE name = 'Film & TV')),
('Screenwriter', (SELECT id FROM profession_categories WHERE name = 'Film & TV')),
-- Games
('Game Designer', (SELECT id FROM profession_categories WHERE name = 'Games')),
('Game Developer', (SELECT id FROM profession_categories WHERE name = 'Games')),
('Game Artist', (SELECT id FROM profession_categories WHERE name = 'Games')),
-- Design
('Graphic Designer', (SELECT id FROM profession_categories WHERE name = 'Design')),
('UI/UX Designer', (SELECT id FROM profession_categories WHERE name = 'Design')),
('Web Designer', (SELECT id FROM profession_categories WHERE name = 'Design')),
-- Technology
('Software Developer', (SELECT id FROM profession_categories WHERE name = 'Technology')),
('Technical Director', (SELECT id FROM profession_categories WHERE name = 'Technology')),
-- Management
('Project Manager', (SELECT id FROM profession_categories WHERE name = 'Management')),
('Creative Director', (SELECT id FROM profession_categories WHERE name = 'Management')),
-- Education
('Teacher', (SELECT id FROM profession_categories WHERE name = 'Education')),
('Professor', (SELECT id FROM profession_categories WHERE name = 'Education'));

-- ====================================
-- 3. MEMBERSHIP TYPE NORMALIZATION
-- ====================================

CREATE TABLE membership_types (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    annual_fee DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'EUR',
    benefits TEXT[],
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert membership types
INSERT INTO membership_types (name, display_name, annual_fee, benefits, description) VALUES
('student', 'Estudiante', 15.00, ARRAY['Access to network', 'Educational resources', 'Events'], 'Membership for students'),
('professional', 'Profesional', 30.00, ARRAY['Full network access', 'Job board', 'Events', 'Professional development'], 'Full professional membership'),
('collaborator', 'Colaborador/a', 50.00, ARRAY['Full network access', 'Job board', 'Events', 'Professional development', 'Special recognition'], 'Collaborator membership with additional benefits'),
('board_member', 'Miembro de Junta', 30.00, ARRAY['Full access', 'Board responsibilities', 'Leadership opportunities'], 'Board member with governance responsibilities'),
('admin', 'Administrador', 0.00, ARRAY['Full system access', 'Administrative privileges'], 'Administrative access');

-- ====================================
-- 4. EDUCATION NORMALIZATION
-- ====================================

CREATE TABLE education_levels (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    level_order INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE educational_institutions (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT, -- university, college, institute, etc.
    country_id INTEGER REFERENCES countries(id),
    website TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(name, country_id)
);

CREATE TABLE study_fields (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    category TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE member_education (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    institution_id INTEGER REFERENCES educational_institutions(id),
    education_level_id INTEGER REFERENCES education_levels(id),
    field_of_study_id INTEGER REFERENCES study_fields(id),
    degree_name TEXT,
    graduation_year INTEGER,
    is_completed BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert education levels
INSERT INTO education_levels (name, level_order, description) VALUES
('Educación Secundaria', 1, 'Secondary Education'),
('Bachillerato', 2, 'High School'),
('Formación Profesional', 3, 'Vocational Training'),
('Diplomatura', 4, 'Diploma'),
('Licenciatura', 5, 'Bachelor''s Degree'),
('Ingeniería', 6, 'Engineering Degree'),
('Máster', 7, 'Master''s Degree'),
('Doctorado', 8, 'Doctorate/PhD'),
('Otros', 9, 'Other');

-- Common study fields for animation/media industry
INSERT INTO study_fields (name, category) VALUES
('Animación', 'Art & Design'),
('Bellas Artes', 'Art & Design'),
('Diseño Gráfico', 'Art & Design'),
('Comunicación Audiovisual', 'Media & Communication'),
('Cine y Televisión', 'Media & Communication'),
('Informática', 'Technology'),
('Ingeniería Informática', 'Technology'),
('Multimedia', 'Technology'),
('Periodismo', 'Media & Communication'),
('Publicidad', 'Marketing & Communication'),
('Diseño Industrial', 'Design'),
('Arquitectura', 'Design'),
('Psicología', 'Social Sciences'),
('Administración de Empresas', 'Business'),
('Marketing', 'Business'),
('Otros', 'Other');

-- ====================================
-- 5. SALARY RANGE NORMALIZATION
-- ====================================

CREATE TABLE salary_ranges (
    id SERIAL PRIMARY KEY,
    min_amount INTEGER,
    max_amount INTEGER,
    currency VARCHAR(3) DEFAULT 'EUR',
    description TEXT NOT NULL,
    display_order INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert salary ranges (annual, in EUR)
INSERT INTO salary_ranges (min_amount, max_amount, description, display_order) VALUES
(0, 15000, 'Menos de 15.000€', 1),
(15000, 25000, '15.000€ - 25.000€', 2),
(25000, 35000, '25.000€ - 35.000€', 3),
(35000, 45000, '35.000€ - 45.000€', 4),
(45000, 55000, '45.000€ - 55.000€', 5),
(55000, 65000, '55.000€ - 65.000€', 6),
(65000, 75000, '65.000€ - 75.000€', 7),
(75000, NULL, 'Más de 75.000€', 8),
(NULL, NULL, 'Prefiero no decirlo', 9);

-- ====================================
-- 6. ADD FOREIGN KEY COLUMNS TO MEMBERS TABLE
-- ====================================

-- Add foreign key columns (without dropping existing columns yet)
ALTER TABLE members ADD COLUMN country_id INTEGER REFERENCES countries(id);
ALTER TABLE members ADD COLUMN province_id INTEGER REFERENCES provinces(id);
ALTER TABLE members ADD COLUMN autonomous_community_id INTEGER REFERENCES autonomous_communities(id);
ALTER TABLE members ADD COLUMN company_id INTEGER REFERENCES companies(id);
ALTER TABLE members ADD COLUMN membership_type_id INTEGER REFERENCES membership_types(id);
ALTER TABLE members ADD COLUMN salary_range_id INTEGER REFERENCES salary_ranges(id);

-- ====================================
-- 7. CREATE INDEXES FOR PERFORMANCE
-- ====================================

-- Geographic indexes
CREATE INDEX idx_countries_code ON countries(code);
CREATE INDEX idx_autonomous_communities_country_id ON autonomous_communities(country_id);
CREATE INDEX idx_provinces_autonomous_community_id ON provinces(autonomous_community_id);
CREATE INDEX idx_provinces_country_id ON provinces(country_id);

-- Profession indexes
CREATE INDEX idx_professions_category_id ON professions(category_id);
CREATE INDEX idx_member_professions_member_id ON member_professions(member_id);
CREATE INDEX idx_member_professions_profession_id ON member_professions(profession_id);
CREATE INDEX idx_member_professions_is_primary ON member_professions(is_primary);

-- Education indexes
CREATE INDEX idx_educational_institutions_country_id ON educational_institutions(country_id);
CREATE INDEX idx_member_education_member_id ON member_education(member_id);
CREATE INDEX idx_member_education_institution_id ON member_education(institution_id);
CREATE INDEX idx_member_education_level_id ON member_education(education_level_id);

-- Members table foreign key indexes
CREATE INDEX idx_members_country_id ON members(country_id);
CREATE INDEX idx_members_province_id ON members(province_id);
CREATE INDEX idx_members_autonomous_community_id ON members(autonomous_community_id);
CREATE INDEX idx_members_company_id ON members(company_id);
CREATE INDEX idx_members_membership_type_id ON members(membership_type_id);
CREATE INDEX idx_members_salary_range_id ON members(salary_range_id);

-- ====================================
-- 8. POPULATE FOREIGN KEY RELATIONSHIPS
-- ====================================

-- Update country references
UPDATE members SET country_id = c.id 
FROM countries c 
WHERE (members.country = c.code OR members.country = c.name_es) 
AND members.country_id IS NULL;

-- Update membership type references
UPDATE members SET membership_type_id = mt.id
FROM membership_types mt
WHERE members.membership_type = mt.name
AND members.membership_type_id IS NULL;

-- Create companies from existing member data
INSERT INTO companies (name)
SELECT DISTINCT company
FROM members 
WHERE company IS NOT NULL 
  AND company != '' 
  AND company NOT IN (SELECT name FROM companies);

-- Update company references
UPDATE members SET company_id = c.id
FROM companies c
WHERE members.company = c.name
AND members.company_id IS NULL;

-- Update salary range references (assuming current salary_range values are range IDs)
UPDATE members SET salary_range_id = members.salary_range
WHERE members.salary_range IS NOT NULL
AND members.salary_range BETWEEN 1 AND 9;

COMMIT;
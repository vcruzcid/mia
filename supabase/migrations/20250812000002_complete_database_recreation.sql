-- =====================================
-- COMPLETE DATABASE RECREATION SCRIPT
-- =====================================
-- This script drops all existing tables and recreates the database
-- with full normalization implementation.
-- SAFE TO RUN - No production data to preserve

-- ====================================
-- PHASE 1: DROP ALL EXISTING TABLES
-- ====================================

-- Drop existing tables in dependency order
DROP TABLE IF EXISTS member_professions CASCADE;
DROP TABLE IF EXISTS member_education CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS professions CASCADE;
DROP TABLE IF EXISTS profession_categories CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS provinces CASCADE;
DROP TABLE IF EXISTS autonomous_communities CASCADE;
DROP TABLE IF EXISTS countries CASCADE;
DROP TABLE IF EXISTS educational_institutions CASCADE;
DROP TABLE IF EXISTS education_levels CASCADE;
DROP TABLE IF EXISTS study_fields CASCADE;
DROP TABLE IF EXISTS membership_types CASCADE;
DROP TABLE IF EXISTS salary_ranges CASCADE;

-- Drop any existing functions that might reference these tables
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ====================================
-- PHASE 2: CREATE UTILITY FUNCTIONS
-- ====================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ====================================
-- PHASE 3: CREATE NORMALIZED TABLES
-- ====================================

-- 1. GEOGRAPHIC NORMALIZATION

-- Countries table for standardized country reference
CREATE TABLE countries (
    id SERIAL PRIMARY KEY,
    code VARCHAR(2) UNIQUE NOT NULL,
    name TEXT NOT NULL,
    name_es TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Autonomous communities (Spanish regions)
CREATE TABLE autonomous_communities (
    id SERIAL PRIMARY KEY,
    country_id INTEGER REFERENCES countries(id) ON DELETE CASCADE,
    code VARCHAR(10),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(country_id, code)
);

-- Provinces within autonomous communities
CREATE TABLE provinces (
    id SERIAL PRIMARY KEY,
    autonomous_community_id INTEGER REFERENCES autonomous_communities(id) ON DELETE CASCADE,
    country_id INTEGER REFERENCES countries(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(autonomous_community_id, name)
);

-- 2. PROFESSIONAL NORMALIZATION

-- Profession categories for grouping similar professions
CREATE TABLE profession_categories (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Standardized professions with categories
CREATE TABLE professions (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category_id INTEGER REFERENCES profession_categories(id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(name, category_id)
);

-- Companies with industry classification
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    industry TEXT,
    size_category TEXT CHECK (size_category IN ('startup', 'small', 'medium', 'large', 'enterprise')),
    website TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. EDUCATION NORMALIZATION

-- Education levels with hierarchy
CREATE TABLE education_levels (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    level_order INTEGER UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Educational institutions
CREATE TABLE educational_institutions (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('university', 'college', 'academy', 'school', 'institute', 'other')),
    country_id INTEGER REFERENCES countries(id) ON DELETE SET NULL,
    website TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study fields for academic specialization
CREATE TABLE study_fields (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MEMBERSHIP NORMALIZATION

-- Membership types with structured benefits
CREATE TABLE membership_types (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    annual_fee DECIMAL(10,2),
    benefits JSONB DEFAULT '[]',
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    stripe_price_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SALARY NORMALIZATION

-- Salary ranges with clear definitions
CREATE TABLE salary_ranges (
    id SERIAL PRIMARY KEY,
    min_amount DECIMAL(10,2) NOT NULL,
    max_amount DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'EUR',
    description TEXT NOT NULL,
    display_order INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (max_amount IS NULL OR max_amount > min_amount)
);

-- ====================================
-- PHASE 4: CREATE MAIN MEMBERS TABLE
-- ====================================

-- Main members table with normalized foreign keys
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Authentication fields
    email TEXT UNIQUE NOT NULL,
    auth_user_id UUID UNIQUE,
    
    -- Personal information
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    member_number INTEGER UNIQUE,
    bio TEXT,
    birth_date DATE,
    
    -- Geographic information (normalized)
    country_id INTEGER REFERENCES countries(id) ON DELETE SET NULL,
    province_id INTEGER REFERENCES provinces(id) ON DELETE SET NULL,
    autonomous_community_id INTEGER REFERENCES autonomous_communities(id) ON DELETE SET NULL,
    city TEXT,
    
    -- Professional information (normalized)
    company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL,
    job_title TEXT,
    years_experience INTEGER CHECK (years_experience >= 0),
    
    -- Membership information (normalized)
    membership_type_id INTEGER NOT NULL REFERENCES membership_types(id),
    membership_status TEXT DEFAULT 'active' CHECK (membership_status IN ('active', 'inactive', 'pending', 'cancelled')),
    membership_start_date DATE DEFAULT CURRENT_DATE,
    membership_end_date DATE,
    
    -- Financial information (normalized)
    salary_range_id INTEGER REFERENCES salary_ranges(id) ON DELETE SET NULL,
    
    -- Contact and availability
    phone TEXT,
    linkedin_url TEXT,
    website_url TEXT,
    instagram_url TEXT,
    twitter_url TEXT,
    available_for_work BOOLEAN DEFAULT false,
    available_for_mentoring BOOLEAN DEFAULT false,
    available_for_collaboration BOOLEAN DEFAULT false,
    
    -- Profile settings
    profile_image_url TEXT,
    is_public BOOLEAN DEFAULT true,
    show_email BOOLEAN DEFAULT false,
    show_phone BOOLEAN DEFAULT false,
    
    -- System fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    
    -- Stripe integration
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT UNIQUE,
    stripe_subscription_status TEXT,
    
    -- Legacy fields (kept for transition period)
    country TEXT, -- Will be removed after migration
    province TEXT, -- Will be removed after migration
    autonomous_community TEXT, -- Will be removed after migration
    main_profession TEXT, -- Will be removed after migration
    company TEXT, -- Will be removed after migration
    education_level TEXT, -- Will be removed after migration
    educational_institution TEXT, -- Will be removed after migration
    membership_type TEXT, -- Will be removed after migration
    salary_range DECIMAL(10,2) -- Will be removed after migration
);

-- ====================================
-- PHASE 5: CREATE JUNCTION TABLES
-- ====================================

-- Junction table for member professions (supports multiple professions per member)
CREATE TABLE member_professions (
    id SERIAL PRIMARY KEY,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    profession_id INTEGER REFERENCES professions(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    years_experience INTEGER CHECK (years_experience >= 0),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(member_id, profession_id)
);

-- Junction table for member education (supports multiple degrees per member)
CREATE TABLE member_education (
    id SERIAL PRIMARY KEY,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    institution_id INTEGER REFERENCES educational_institutions(id) ON DELETE SET NULL,
    education_level_id INTEGER REFERENCES education_levels(id) ON DELETE SET NULL,
    field_of_study_id INTEGER REFERENCES study_fields(id) ON DELETE SET NULL,
    degree_name TEXT,
    graduation_year INTEGER CHECK (graduation_year >= 1950 AND graduation_year <= EXTRACT(YEAR FROM NOW()) + 10),
    is_completed BOOLEAN DEFAULT true,
    gpa DECIMAL(4,2),
    honors TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================
-- PHASE 6: CREATE INDEXES FOR PERFORMANCE
-- ====================================

-- Member table indexes
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_auth_user_id ON members(auth_user_id);
CREATE INDEX idx_members_member_number ON members(member_number);
CREATE INDEX idx_members_membership_type_id ON members(membership_type_id);
CREATE INDEX idx_members_membership_status ON members(membership_status);
CREATE INDEX idx_members_is_public ON members(is_public);

-- Geographic indexes
CREATE INDEX idx_members_country_id ON members(country_id);
CREATE INDEX idx_members_province_id ON members(province_id);
CREATE INDEX idx_members_autonomous_community_id ON members(autonomous_community_id);
CREATE INDEX idx_autonomous_communities_country_id ON autonomous_communities(country_id);
CREATE INDEX idx_provinces_country_id ON provinces(country_id);
CREATE INDEX idx_provinces_autonomous_community_id ON provinces(autonomous_community_id);

-- Professional indexes
CREATE INDEX idx_members_company_id ON members(company_id);
CREATE INDEX idx_members_salary_range_id ON members(salary_range_id);
CREATE INDEX idx_member_professions_member_id ON member_professions(member_id);
CREATE INDEX idx_member_professions_profession_id ON member_professions(profession_id);
CREATE INDEX idx_member_professions_is_primary ON member_professions(is_primary);
CREATE INDEX idx_professions_category_id ON professions(category_id);

-- Education indexes
CREATE INDEX idx_member_education_member_id ON member_education(member_id);
CREATE INDEX idx_member_education_institution_id ON member_education(institution_id);
CREATE INDEX idx_member_education_education_level_id ON member_education(education_level_id);
CREATE INDEX idx_member_education_field_of_study_id ON member_education(field_of_study_id);
CREATE INDEX idx_educational_institutions_country_id ON educational_institutions(country_id);

-- Availability indexes for search
CREATE INDEX idx_members_available_for_work ON members(available_for_work);
CREATE INDEX idx_members_available_for_mentoring ON members(available_for_mentoring);
CREATE INDEX idx_members_available_for_collaboration ON members(available_for_collaboration);

-- ====================================
-- PHASE 7: CREATE TRIGGERS
-- ====================================

-- Updated_at triggers for all tables
CREATE TRIGGER update_countries_updated_at BEFORE UPDATE ON countries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_autonomous_communities_updated_at BEFORE UPDATE ON autonomous_communities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_provinces_updated_at BEFORE UPDATE ON provinces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profession_categories_updated_at BEFORE UPDATE ON profession_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_professions_updated_at BEFORE UPDATE ON professions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_education_levels_updated_at BEFORE UPDATE ON education_levels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_educational_institutions_updated_at BEFORE UPDATE ON educational_institutions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_study_fields_updated_at BEFORE UPDATE ON study_fields FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_membership_types_updated_at BEFORE UPDATE ON membership_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_salary_ranges_updated_at BEFORE UPDATE ON salary_ranges FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_member_professions_updated_at BEFORE UPDATE ON member_professions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_member_education_updated_at BEFORE UPDATE ON member_education FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================
-- PHASE 8: INSERT REFERENCE DATA
-- ====================================

-- Insert countries
INSERT INTO countries (code, name, name_es) VALUES
('ES', 'Spain', 'España'),
('MX', 'Mexico', 'México'),
('CO', 'Colombia', 'Colombia'),
('CH', 'Switzerland', 'Suiza'),
('BR', 'Brazil', 'Brasil'),
('US', 'United States', 'Estados Unidos'),
('CL', 'Chile', 'Chile'),
('PT', 'Portugal', 'Portugal'),
('DO', 'Dominican Republic', 'República Dominicana'),
('AR', 'Argentina', 'Argentina'),
('PE', 'Peru', 'Perú'),
('VE', 'Venezuela', 'Venezuela'),
('UY', 'Uruguay', 'Uruguay'),
('EC', 'Ecuador', 'Ecuador'),
('GT', 'Guatemala', 'Guatemala'),
('CR', 'Costa Rica', 'Costa Rica'),
('PA', 'Panama', 'Panamá'),
('FR', 'France', 'Francia'),
('IT', 'Italy', 'Italia'),
('DE', 'Germany', 'Alemania'),
('GB', 'United Kingdom', 'Reino Unido'),
('IE', 'Ireland', 'Irlanda'),
('NL', 'Netherlands', 'Países Bajos'),
('BE', 'Belgium', 'Bélgica'),
('AT', 'Austria', 'Austria'),
('SE', 'Sweden', 'Suecia'),
('DK', 'Denmark', 'Dinamarca'),
('NO', 'Norway', 'Noruega'),
('FI', 'Finland', 'Finlandia'),
('PL', 'Poland', 'Polonia'),
('CZ', 'Czech Republic', 'República Checa'),
('CA', 'Canada', 'Canadá'),
('AU', 'Australia', 'Australia'),
('NZ', 'New Zealand', 'Nueva Zelanda'),
('JP', 'Japan', 'Japón'),
('KR', 'South Korea', 'Corea del Sur'),
('CN', 'China', 'China'),
('IN', 'India', 'India'),
('SG', 'Singapore', 'Singapur'),
('ZA', 'South Africa', 'Sudáfrica');

-- Insert Spanish autonomous communities
INSERT INTO autonomous_communities (country_id, code, name) VALUES
((SELECT id FROM countries WHERE code = 'ES'), 'AN', 'Andalucía'),
((SELECT id FROM countries WHERE code = 'ES'), 'AR', 'Aragón'),
((SELECT id FROM countries WHERE code = 'ES'), 'AS', 'Asturias'),
((SELECT id FROM countries WHERE code = 'ES'), 'IB', 'Baleares'),
((SELECT id FROM countries WHERE code = 'ES'), 'PV', 'País Vasco'),
((SELECT id FROM countries WHERE code = 'ES'), 'CN', 'Canarias'),
((SELECT id FROM countries WHERE code = 'ES'), 'CB', 'Cantabria'),
((SELECT id FROM countries WHERE code = 'ES'), 'CM', 'Castilla-La Mancha'),
((SELECT id FROM countries WHERE code = 'ES'), 'CL', 'Castilla y León'),
((SELECT id FROM countries WHERE code = 'ES'), 'CT', 'Cataluña'),
((SELECT id FROM countries WHERE code = 'ES'), 'VC', 'Comunidad Valenciana'),
((SELECT id FROM countries WHERE code = 'ES'), 'EX', 'Extremadura'),
((SELECT id FROM countries WHERE code = 'ES'), 'GA', 'Galicia'),
((SELECT id FROM countries WHERE code = 'ES'), 'MD', 'Madrid'),
((SELECT id FROM countries WHERE code = 'ES'), 'MC', 'Murcia'),
((SELECT id FROM countries WHERE code = 'ES'), 'NA', 'Navarra'),
((SELECT id FROM countries WHERE code = 'ES'), 'RI', 'La Rioja'),
((SELECT id FROM countries WHERE code = 'ES'), 'CE', 'Ceuta'),
((SELECT id FROM countries WHERE code = 'ES'), 'ML', 'Melilla');

-- Insert major Spanish provinces
INSERT INTO provinces (autonomous_community_id, country_id, name) VALUES
((SELECT id FROM autonomous_communities WHERE code = 'MD'), (SELECT id FROM countries WHERE code = 'ES'), 'Madrid'),
((SELECT id FROM autonomous_communities WHERE code = 'CT'), (SELECT id FROM countries WHERE code = 'ES'), 'Barcelona'),
((SELECT id FROM autonomous_communities WHERE code = 'VC'), (SELECT id FROM countries WHERE code = 'ES'), 'Valencia'),
((SELECT id FROM autonomous_communities WHERE code = 'AN'), (SELECT id FROM countries WHERE code = 'ES'), 'Sevilla'),
((SELECT id FROM autonomous_communities WHERE code = 'AN'), (SELECT id FROM countries WHERE code = 'ES'), 'Málaga'),
((SELECT id FROM autonomous_communities WHERE code = 'PV'), (SELECT id FROM countries WHERE code = 'ES'), 'Vizcaya'),
((SELECT id FROM autonomous_communities WHERE code = 'GA'), (SELECT id FROM countries WHERE code = 'ES'), 'A Coruña'),
((SELECT id FROM autonomous_communities WHERE code = 'CL'), (SELECT id FROM countries WHERE code = 'ES'), 'Valladolid'),
((SELECT id FROM autonomous_communities WHERE code = 'AR'), (SELECT id FROM countries WHERE code = 'ES'), 'Zaragoza'),
((SELECT id FROM autonomous_communities WHERE code = 'AS'), (SELECT id FROM countries WHERE code = 'ES'), 'Asturias'),
((SELECT id FROM autonomous_communities WHERE code = 'CT'), (SELECT id FROM countries WHERE code = 'ES'), 'Girona'),
((SELECT id FROM autonomous_communities WHERE code = 'CT'), (SELECT id FROM countries WHERE code = 'ES'), 'Lleida'),
((SELECT id FROM autonomous_communities WHERE code = 'CT'), (SELECT id FROM countries WHERE code = 'ES'), 'Tarragona'),
((SELECT id FROM autonomous_communities WHERE code = 'VC'), (SELECT id FROM countries WHERE code = 'ES'), 'Alicante'),
((SELECT id FROM autonomous_communities WHERE code = 'VC'), (SELECT id FROM countries WHERE code = 'ES'), 'Castellón'),
((SELECT id FROM autonomous_communities WHERE code = 'AN'), (SELECT id FROM countries WHERE code = 'ES'), 'Cádiz'),
((SELECT id FROM autonomous_communities WHERE code = 'AN'), (SELECT id FROM countries WHERE code = 'ES'), 'Córdoba'),
((SELECT id FROM autonomous_communities WHERE code = 'AN'), (SELECT id FROM countries WHERE code = 'ES'), 'Granada'),
((SELECT id FROM autonomous_communities WHERE code = 'PV'), (SELECT id FROM countries WHERE code = 'ES'), 'Álava'),
((SELECT id FROM autonomous_communities WHERE code = 'PV'), (SELECT id FROM countries WHERE code = 'ES'), 'Gipuzkoa'),
((SELECT id FROM autonomous_communities WHERE code = 'CN'), (SELECT id FROM countries WHERE code = 'ES'), 'Las Palmas'),
((SELECT id FROM autonomous_communities WHERE code = 'CN'), (SELECT id FROM countries WHERE code = 'ES'), 'Santa Cruz de Tenerife'),
((SELECT id FROM autonomous_communities WHERE code = 'GA'), (SELECT id FROM countries WHERE code = 'ES'), 'Pontevedra'),
((SELECT id FROM autonomous_communities WHERE code = 'MC'), (SELECT id FROM countries WHERE code = 'ES'), 'Murcia');

-- Insert profession categories
INSERT INTO profession_categories (name, description) VALUES
('Animation & VFX', 'Animation, visual effects, and motion graphics professionals'),
('Film & TV Production', 'Film and television production roles and management'),
('Art & Design', 'Creative and artistic roles including concept art and character design'),
('Technical', 'Technical and pipeline roles including rigging and compositing'),
('Management & Leadership', 'Management, direction, and leadership positions'),
('Education & Training', 'Teaching, training, and educational roles'),
('Marketing & Business', 'Business development, marketing, and commercial roles'),
('Writing & Development', 'Scriptwriting, story development, and creative writing'),
('Audio & Sound', 'Sound design, music composition, and audio production'),
('Other', 'Other industry-related roles and emerging specializations');

-- Insert professions
INSERT INTO professions (name, category_id, description) VALUES
-- Animation & VFX
('Animadora 2D', (SELECT id FROM profession_categories WHERE name = 'Animation & VFX'), 'Traditional 2D animation artist'),
('Animadora 3D', (SELECT id FROM profession_categories WHERE name = 'Animation & VFX'), '3D computer animation artist'),
('Animadora Stop Motion', (SELECT id FROM profession_categories WHERE name = 'Animation & VFX'), 'Stop motion animation specialist'),
('Artista 3D', (SELECT id FROM profession_categories WHERE name = 'Animation & VFX'), '3D modeling and texturing artist'),
('FX', (SELECT id FROM profession_categories WHERE name = 'Animation & VFX'), 'Visual effects and special effects artist'),
('Compositing', (SELECT id FROM profession_categories WHERE name = 'Animation & VFX'), 'Compositing and post-production specialist'),

-- Film & TV Production
('Productora', (SELECT id FROM profession_categories WHERE name = 'Film & TV Production'), 'Film and TV producer'),
('Productora Ejecutiva', (SELECT id FROM profession_categories WHERE name = 'Film & TV Production'), 'Executive producer'),
('Directora de Producción', (SELECT id FROM profession_categories WHERE name = 'Film & TV Production'), 'Production director'),
('Supervisora de Producción', (SELECT id FROM profession_categories WHERE name = 'Film & TV Production'), 'Production supervisor'),
('Coordinadora de Producción', (SELECT id FROM profession_categories WHERE name = 'Film & TV Production'), 'Production coordinator'),
('Asistente de Producción', (SELECT id FROM profession_categories WHERE name = 'Film & TV Production'), 'Production assistant'),
('Directora', (SELECT id FROM profession_categories WHERE name = 'Film & TV Production'), 'Director'),
('Directora de Cine', (SELECT id FROM profession_categories WHERE name = 'Film & TV Production'), 'Film director'),
('Desarrollo', (SELECT id FROM profession_categories WHERE name = 'Film & TV Production'), 'Development executive'),
('Doblaje', (SELECT id FROM profession_categories WHERE name = 'Film & TV Production'), 'Voice acting and dubbing'),
('Distribución y Ventas', (SELECT id FROM profession_categories WHERE name = 'Film & TV Production'), 'Distribution and sales'),

-- Art & Design
('Concept Artist', (SELECT id FROM profession_categories WHERE name = 'Art & Design'), 'Concept art and visual development'),
('Diseñadora de Personajes', (SELECT id FROM profession_categories WHERE name = 'Art & Design'), 'Character design specialist'),
('Diseñadora de Fondos', (SELECT id FROM profession_categories WHERE name = 'Art & Design'), 'Background and environment designer'),
('Directora de Arte', (SELECT id FROM profession_categories WHERE name = 'Art & Design'), 'Art director'),
('Artista de Layout', (SELECT id FROM profession_categories WHERE name = 'Art & Design'), 'Layout artist'),
('Storyboardista', (SELECT id FROM profession_categories WHERE name = 'Art & Design'), 'Storyboard artist'),
('Ilustración', (SELECT id FROM profession_categories WHERE name = 'Art & Design'), 'Illustrator'),
('Fondista', (SELECT id FROM profession_categories WHERE name = 'Art & Design'), 'Background painter'),
('Clean-up', (SELECT id FROM profession_categories WHERE name = 'Art & Design'), 'Clean-up artist'),

-- Technical
('Rigger', (SELECT id FROM profession_categories WHERE name = 'Technical'), 'Character rigging specialist'),
('Pipeline TD', (SELECT id FROM profession_categories WHERE name = 'Technical'), 'Pipeline technical director'),

-- Management & Leadership
('CEO', (SELECT id FROM profession_categories WHERE name = 'Management & Leadership'), 'Chief Executive Officer'),
('Directora Creativa', (SELECT id FROM profession_categories WHERE name = 'Management & Leadership'), 'Creative director'),
('Directora de Animación', (SELECT id FROM profession_categories WHERE name = 'Management & Leadership'), 'Animation director'),
('Directora de Proyecto', (SELECT id FROM profession_categories WHERE name = 'Management & Leadership'), 'Project director'),

-- Education & Training
('Profesora', (SELECT id FROM profession_categories WHERE name = 'Education & Training'), 'Professor or instructor'),
('Estudiante', (SELECT id FROM profession_categories WHERE name = 'Education & Training'), 'Student'),

-- Writing & Development
('Guionista', (SELECT id FROM profession_categories WHERE name = 'Writing & Development'), 'Screenwriter'),

-- Marketing & Business
('Marketing', (SELECT id FROM profession_categories WHERE name = 'Marketing & Business'), 'Marketing specialist'),
('Consultora', (SELECT id FROM profession_categories WHERE name = 'Marketing & Business'), 'Business consultant');

-- Insert education levels
INSERT INTO education_levels (name, level_order, description) VALUES
('Educación Primaria', 1, 'Primary education'),
('Educación Secundaria', 2, 'Secondary education'),
('Bachillerato', 3, 'High school completion'),
('Formación Profesional Básica', 4, 'Basic vocational training'),
('Formación Profesional Media', 5, 'Intermediate vocational training'),
('Formación Profesional Superior', 6, 'Advanced vocational training'),
('Diplomatura', 7, 'University diploma (3 years)'),
('Grado', 8, 'Bachelor degree (4 years)'),
('Licenciatura', 9, 'University degree (5 years, pre-Bologna)'),
('Máster', 10, 'Master degree'),
('Doctorado', 11, 'PhD or doctorate degree'),
('Curso Especialización', 12, 'Specialization course'),
('Certificación Profesional', 13, 'Professional certification');

-- Insert study fields
INSERT INTO study_fields (name, category) VALUES
-- Animation and Arts
('Animación', 'Arts & Design'),
('Bellas Artes', 'Arts & Design'),
('Diseño Gráfico', 'Arts & Design'),
('Diseño Industrial', 'Arts & Design'),
('Arte Digital', 'Arts & Design'),
('Ilustración', 'Arts & Design'),
('Historia del Arte', 'Arts & Design'),

-- Film and Media
('Comunicación Audiovisual', 'Media & Communication'),
('Cine y Televisión', 'Media & Communication'),
('Periodismo', 'Media & Communication'),
('Publicidad y Relaciones Públicas', 'Media & Communication'),
('Producción Audiovisual', 'Media & Communication'),

-- Technology
('Ingeniería Informática', 'Technology'),
('Ingeniería Multimedia', 'Technology'),
('Desarrollo de Videojuegos', 'Technology'),
('Programación', 'Technology'),
('Sistemas de Información', 'Technology'),

-- Business
('Administración de Empresas', 'Business'),
('Marketing', 'Business'),
('Gestión Cultural', 'Business'),
('Economía', 'Business'),

-- Education
('Pedagogía', 'Education'),
('Psicología', 'Education'),
('Educación Artística', 'Education'),

-- Other
('Arquitectura', 'Other'),
('Psicología', 'Other'),
('Filosofía', 'Other'),
('Literatura', 'Other'),
('Música', 'Other'),
('Teatro', 'Other');

-- Insert membership types with Stripe integration
INSERT INTO membership_types (name, display_name, annual_fee, benefits, description, stripe_price_id) VALUES
('admin', 'Administradora', 0, 
 '["Full admin access", "All member benefits", "Platform management", "User management", "Analytics access"]', 
 'Administrative access with full platform control', 
 NULL),
('member', 'Socia', 0, 
 '["Directory access", "Basic networking events", "Resource library", "Newsletter subscription", "Community access"]', 
 'Basic membership with essential networking features', 
 NULL),
('profesional', 'Socia Profesional', 30, 
 '["All member benefits", "Premium networking events", "Industry reports", "Job board access", "Mentorship program", "Workshop discounts", "Professional badge", "Priority support"]', 
 'Professional membership with enhanced networking and career development benefits', 
 'price_professional_annual'),
('estudiante', 'Estudiante', 15,
 '["Student directory access", "Educational networking events", "Career resources", "Mentorship access", "Workshop discounts", "Job board access"]',
 'Student membership with career development focus',
 'price_student_annual'),
('colaboradora', 'Colaboradora', 50,
 '["All professional benefits", "Collaboration opportunities", "Project matching", "Enhanced visibility", "Industry partnerships", "Speaking opportunities", "VIP event access"]',
 'Premium membership for established professionals seeking collaboration',
 'price_collaborator_annual');

-- Insert salary ranges
INSERT INTO salary_ranges (min_amount, max_amount, description, display_order) VALUES
(0, 15000, 'Hasta 15.000€', 1),
(15000, 25000, '15.000€ - 25.000€', 2),
(25000, 35000, '25.000€ - 35.000€', 3),
(35000, 45000, '35.000€ - 45.000€', 4),
(45000, 60000, '45.000€ - 60.000€', 5),
(60000, 80000, '60.000€ - 80.000€', 6),
(80000, NULL, 'Más de 80.000€', 7);

-- Insert major animation companies
INSERT INTO companies (name, industry, size_category) VALUES
('Ilion Animation Studios', 'Animation & VFX', 'large'),
('Kandor Graphics', 'Animation & VFX', 'medium'),
('Lightbox Entertainment', 'Animation & VFX', 'medium'),
('Zinkia Entertainment', 'Animation & VFX', 'medium'),
('BRB Internacional', 'Animation & VFX', 'medium'),
('Dibulitoon Studio', 'Animation & VFX', 'small'),
('Ártico Animation', 'Animation & VFX', 'small'),
('Hampa Animation Studio', 'Animation & VFX', 'small'),
('Sygnatia', 'Animation & VFX', 'small'),
('Freelance', 'Independent', 'startup'),
('Estudiante en prácticas', 'Education', 'startup'),
('Empresa propia', 'Independent', 'startup');

-- Insert major educational institutions
INSERT INTO educational_institutions (name, type, country_id) VALUES
-- Spanish universities
('Universidad Politécnica de Valencia', 'university', (SELECT id FROM countries WHERE code = 'ES')),
('Universidad Complutense de Madrid', 'university', (SELECT id FROM countries WHERE code = 'ES')),
('Universidad de Barcelona', 'university', (SELECT id FROM countries WHERE code = 'ES')),
('Universidad del País Vasco', 'university', (SELECT id FROM countries WHERE code = 'ES')),
('Universidad de Sevilla', 'university', (SELECT id FROM countries WHERE code = 'ES')),

-- Art and design schools
('Escuela Superior de Diseño de Valencia', 'school', (SELECT id FROM countries WHERE code = 'ES')),
('IED Madrid', 'institute', (SELECT id FROM countries WHERE code = 'ES')),
('Escuela de Arte de Granada', 'school', (SELECT id FROM countries WHERE code = 'ES')),
('EINA - Escola de Disseny i Art', 'school', (SELECT id FROM countries WHERE code = 'ES')),

-- Animation specific
('Escuela de Animación FX Animation', 'academy', (SELECT id FROM countries WHERE code = 'ES')),
('Trazos', 'academy', (SELECT id FROM countries WHERE code = 'ES')),
('Animum Creativity Advanced School', 'academy', (SELECT id FROM countries WHERE code = 'ES')),

-- International
('CalArts', 'university', (SELECT id FROM countries WHERE code = 'US')),
('Gobelins', 'school', (SELECT id FROM countries WHERE code = 'FR')),
('The Animation Workshop', 'school', (SELECT id FROM countries WHERE code = 'DK'));

-- ====================================
-- PHASE 9: ENABLE RLS (ROW LEVEL SECURITY)
-- ====================================

-- Enable RLS on sensitive tables
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_professions ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_education ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for members
CREATE POLICY "Members can view public profiles" ON members
    FOR SELECT USING (is_public = true);

CREATE POLICY "Members can view their own profile" ON members
    FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Members can update their own profile" ON members
    FOR UPDATE USING (auth.uid() = auth_user_id);

-- Create RLS policies for member professions
CREATE POLICY "Anyone can view professions of public members" ON member_professions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM members 
            WHERE members.id = member_professions.member_id 
            AND members.is_public = true
        )
    );

CREATE POLICY "Members can manage their own professions" ON member_professions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM members 
            WHERE members.id = member_professions.member_id 
            AND members.auth_user_id = auth.uid()
        )
    );

-- Create RLS policies for member education
CREATE POLICY "Anyone can view education of public members" ON member_education
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM members 
            WHERE members.id = member_education.member_id 
            AND members.is_public = true
        )
    );

CREATE POLICY "Members can manage their own education" ON member_education
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM members 
            WHERE members.id = member_education.member_id 
            AND members.auth_user_id = auth.uid()
        )
    );

-- ====================================
-- PHASE 10: CREATE VIEWS FOR QUERIES
-- ====================================

-- View for member profiles with all normalized data
CREATE VIEW member_profiles AS
SELECT 
    m.id,
    m.email,
    m.first_name,
    m.last_name,
    m.member_number,
    m.bio,
    m.birth_date,
    
    -- Geographic data
    c.code as country_code,
    c.name as country_name,
    c.name_es as country_name_es,
    p.name as province_name,
    ac.name as autonomous_community_name,
    m.city,
    
    -- Membership data
    mt.name as membership_type,
    mt.display_name as membership_display_name,
    m.membership_status,
    m.membership_start_date,
    m.membership_end_date,
    
    -- Company data
    comp.name as company_name,
    comp.industry as company_industry,
    comp.size_category as company_size,
    m.job_title,
    m.years_experience,
    
    -- Salary data
    sr.description as salary_range_description,
    sr.min_amount as salary_min,
    sr.max_amount as salary_max,
    
    -- Contact and availability
    m.phone,
    m.linkedin_url,
    m.website_url,
    m.instagram_url,
    m.twitter_url,
    m.available_for_work,
    m.available_for_mentoring,
    m.available_for_collaboration,
    
    -- Profile settings
    m.profile_image_url,
    m.is_public,
    m.show_email,
    m.show_phone,
    
    -- System fields
    m.created_at,
    m.updated_at,
    m.last_login_at

FROM members m
LEFT JOIN countries c ON m.country_id = c.id
LEFT JOIN provinces p ON m.province_id = p.id
LEFT JOIN autonomous_communities ac ON m.autonomous_community_id = ac.id
LEFT JOIN membership_types mt ON m.membership_type_id = mt.id
LEFT JOIN companies comp ON m.company_id = comp.id
LEFT JOIN salary_ranges sr ON m.salary_range_id = sr.id
WHERE m.is_public = true OR m.auth_user_id = auth.uid();

-- View for member professions with categories
CREATE VIEW member_profession_details AS
SELECT 
    mp.id,
    mp.member_id,
    m.first_name,
    m.last_name,
    p.name as profession_name,
    pc.name as profession_category,
    mp.is_primary,
    mp.years_experience,
    mp.description
FROM member_professions mp
JOIN members m ON mp.member_id = m.id
JOIN professions p ON mp.profession_id = p.id
JOIN profession_categories pc ON p.category_id = pc.id
WHERE m.is_public = true OR m.auth_user_id = auth.uid();

-- View for member education details
CREATE VIEW member_education_details AS
SELECT 
    me.id,
    me.member_id,
    m.first_name,
    m.last_name,
    ei.name as institution_name,
    ei.type as institution_type,
    el.name as education_level,
    el.level_order,
    sf.name as field_of_study,
    sf.category as field_category,
    me.degree_name,
    me.graduation_year,
    me.is_completed,
    me.gpa,
    me.honors
FROM member_education me
JOIN members m ON me.member_id = m.id
LEFT JOIN educational_institutions ei ON me.institution_id = ei.id
LEFT JOIN education_levels el ON me.education_level_id = el.id
LEFT JOIN study_fields sf ON me.field_of_study_id = sf.id
WHERE m.is_public = true OR m.auth_user_id = auth.uid();

-- ====================================
-- PHASE 11: CREATE HELPER FUNCTIONS
-- ====================================

-- Function to get member's primary profession
CREATE OR REPLACE FUNCTION get_member_primary_profession(member_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    result TEXT;
BEGIN
    SELECT p.name INTO result
    FROM member_professions mp
    JOIN professions p ON mp.profession_id = p.id
    WHERE mp.member_id = member_uuid AND mp.is_primary = true
    LIMIT 1;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to count members by profession category
CREATE OR REPLACE FUNCTION count_members_by_profession_category()
RETURNS TABLE(category_name TEXT, member_count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pc.name,
        COUNT(DISTINCT mp.member_id)
    FROM profession_categories pc
    LEFT JOIN professions p ON pc.id = p.category_id
    LEFT JOIN member_professions mp ON p.id = mp.profession_id
    LEFT JOIN members m ON mp.member_id = m.id
    WHERE m.is_public = true
    GROUP BY pc.name
    ORDER BY COUNT(DISTINCT mp.member_id) DESC;
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- PHASE 12: ADD COMMENTS FOR DOCUMENTATION
-- ====================================

-- Table comments
COMMENT ON TABLE countries IS 'Standardized country reference table with Spanish translations';
COMMENT ON TABLE autonomous_communities IS 'Spanish autonomous communities within countries';
COMMENT ON TABLE provinces IS 'Spanish provinces within autonomous communities';
COMMENT ON TABLE profession_categories IS 'Professional categories for animation industry';
COMMENT ON TABLE professions IS 'Standardized profession titles within categories';
COMMENT ON TABLE companies IS 'Company directory with industry classification';
COMMENT ON TABLE member_professions IS 'Junction table supporting multiple professions per member';
COMMENT ON TABLE education_levels IS 'Hierarchical education levels with ordering';
COMMENT ON TABLE educational_institutions IS 'Educational institution directory';
COMMENT ON TABLE study_fields IS 'Academic study field categories';
COMMENT ON TABLE member_education IS 'Junction table supporting multiple education records per member';
COMMENT ON TABLE membership_types IS 'Membership type definitions with benefits and Stripe integration';
COMMENT ON TABLE salary_ranges IS 'Salary range categories for reporting and filtering';
COMMENT ON TABLE members IS 'Main members table with normalized foreign key relationships';

-- Column comments for complex fields
COMMENT ON COLUMN members.member_number IS 'Unique member number for identification, preserved from WordPress migration';
COMMENT ON COLUMN members.auth_user_id IS 'Supabase auth user UUID for authentication linking';
COMMENT ON COLUMN members.stripe_customer_id IS 'Stripe customer ID for payment processing';
COMMENT ON COLUMN membership_types.benefits IS 'JSONB array of membership benefits';
COMMENT ON COLUMN salary_ranges.display_order IS 'Order for displaying salary ranges in UI';

-- ====================================
-- SCRIPT COMPLETION MESSAGE
-- ====================================

-- Insert a system record to track migration
INSERT INTO members (
    id,
    email,
    first_name,
    last_name,
    membership_type_id,
    membership_status,
    bio
) VALUES (
    gen_random_uuid(),
    'system@animacionesmia.com',
    'Database',
    'Normalization',
    (SELECT id FROM membership_types WHERE name = 'admin'),
    'active',
    'Database recreated with full normalization on ' || NOW()::TEXT
);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database recreation with normalization completed successfully!';
    RAISE NOTICE 'Tables created: countries, autonomous_communities, provinces, profession_categories, professions, companies, member_professions, education_levels, educational_institutions, study_fields, member_education, membership_types, salary_ranges, members';
    RAISE NOTICE 'Reference data populated: % countries, % profession categories, % professions, % education levels, % membership types, % salary ranges',
        (SELECT COUNT(*) FROM countries),
        (SELECT COUNT(*) FROM profession_categories), 
        (SELECT COUNT(*) FROM professions),
        (SELECT COUNT(*) FROM education_levels),
        (SELECT COUNT(*) FROM membership_types),
        (SELECT COUNT(*) FROM salary_ranges);
    RAISE NOTICE 'Views created: member_profiles, member_profession_details, member_education_details';
    RAISE NOTICE 'RLS enabled with appropriate policies';
    RAISE NOTICE 'Helper functions created for common queries';
END $$;
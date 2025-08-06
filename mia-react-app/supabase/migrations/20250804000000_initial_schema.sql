-- MIA Members Database Schema for Supabase
-- Based on WordPress custom fields analysis
-- Designed for magic link authentication and comprehensive member profiles

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable RLS (Row Level Security)
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- =============================================
-- MEMBERS TABLE
-- =============================================
CREATE TABLE members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- WordPress Migration Reference
  wp_post_id INTEGER UNIQUE,
  wp_user_id INTEGER,
  
  -- Basic Member Info
  member_number INTEGER UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  display_name TEXT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  birth_date DATE,
  
  -- Professional Information
  main_profession TEXT,
  other_professions TEXT[],
  company TEXT,
  years_experience INTEGER,
  biography TEXT, -- Rich text from WordPress
  professional_role TEXT, -- director, supervisor, junior, etc.
  employment_status TEXT, -- propia, ajena
  salary_range INTEGER,
  
  -- Location
  address TEXT,
  postal_code TEXT,
  province TEXT,
  autonomous_community TEXT,
  country TEXT DEFAULT 'España',
  
  -- Social Media & Web (JSON for flexibility)
  social_media JSONB DEFAULT '{}',
  -- Structure: {"linkedin": "url", "instagram": "url", "twitter": "url", "facebook": "url", "website": "url", "youtube": "url", "vimeo": "url", "artstation": "url"}
  
  -- Education
  education_level TEXT, -- master, licenciatura, etc.
  studies_completed TEXT,
  educational_institution TEXT,
  is_student BOOLEAN DEFAULT false,
  
  -- Member Classification
  membership_type TEXT, -- 'socia-de-pleno-derecho', 'estudiante', 'colaboradora'
  is_board_member BOOLEAN DEFAULT false,
  board_position TEXT,
  is_active BOOLEAN DEFAULT true,
  
  -- Privacy & Preferences
  accepts_newsletter BOOLEAN DEFAULT false,
  accepts_job_offers BOOLEAN DEFAULT false,
  gdpr_accepted BOOLEAN DEFAULT true,
  privacy_level TEXT DEFAULT 'public', -- public, members-only, private
  
  -- Personal Information (sensitive)
  personal_situation TEXT, -- casada, soltera, etc.
  has_children BOOLEAN,
  work_life_balance BOOLEAN, -- conciliacion-familiar
  
  -- Industry Issues Awareness
  experienced_gender_discrimination BOOLEAN DEFAULT false,
  experienced_salary_discrimination BOOLEAN DEFAULT false,
  experienced_sexual_harassment BOOLEAN DEFAULT false,
  experienced_sexual_abuse BOOLEAN DEFAULT false,
  experienced_glass_ceiling BOOLEAN DEFAULT false,
  experienced_inequality_episode BOOLEAN DEFAULT false,
  
  -- Stripe Integration
  stripe_customer_id TEXT,
  stripe_subscription_status TEXT,
  
  -- Member Associations
  other_associations TEXT[], -- Array of association names
  
  -- Files & Documents
  cv_document_url TEXT,
  profile_image_url TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  migrated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- MEMBER CATEGORIES TABLE
-- =============================================
CREATE TABLE member_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  category_type TEXT NOT NULL, -- 'profession', 'other_profession', 'member_type', 'board_role', 'country'
  category_name TEXT NOT NULL,
  category_slug TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- MEMBER ACTIVITY LOG
-- =============================================
CREATE TABLE member_activity (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'login', 'profile_update', 'registration', 'payment'
  activity_data JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- STRIPE INTEGRATION TABLE
-- =============================================
CREATE TABLE stripe_customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE NOT NULL,
  customer_data JSONB DEFAULT '{}',
  last_sync TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE stripe_subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  subscription_data JSONB DEFAULT '{}',
  last_sync TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_member_number ON members(member_number);
CREATE INDEX idx_members_wp_post_id ON members(wp_post_id);
CREATE INDEX idx_members_stripe_customer_id ON members(stripe_customer_id);
CREATE INDEX idx_members_is_active ON members(is_active);
CREATE INDEX idx_members_membership_type ON members(membership_type);
CREATE INDEX idx_members_main_profession ON members(main_profession);
CREATE INDEX idx_members_autonomous_community ON members(autonomous_community);

CREATE INDEX idx_member_categories_member_id ON member_categories(member_id);
CREATE INDEX idx_member_categories_type ON member_categories(category_type);

CREATE INDEX idx_stripe_customers_stripe_id ON stripe_customers(stripe_customer_id);
CREATE INDEX idx_stripe_subscriptions_stripe_id ON stripe_subscriptions(stripe_subscription_id);
CREATE INDEX idx_stripe_subscriptions_member_id ON stripe_subscriptions(member_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;

-- Members table policies
CREATE POLICY "Public members are viewable by everyone" 
  ON members FOR SELECT 
  USING (is_active = true AND privacy_level = 'public');

CREATE POLICY "Members can view their own profile" 
  ON members FOR SELECT 
  USING (auth.uid()::text = email OR auth.uid()::text IN (
    SELECT email FROM members WHERE email = auth.jwt()->>'email'
  ));

CREATE POLICY "Members can update their own profile" 
  ON members FOR UPDATE 
  USING (auth.uid()::text = email OR auth.uid()::text IN (
    SELECT email FROM members WHERE email = auth.jwt()->>'email'
  ));

-- Member categories policies
CREATE POLICY "Categories are viewable with member" 
  ON member_categories FOR SELECT 
  USING (
    member_id IN (
      SELECT id FROM members 
      WHERE is_active = true AND privacy_level = 'public'
    )
  );

-- Activity log policies (only own activity)
CREATE POLICY "Members can view their own activity" 
  ON member_activity FOR SELECT 
  USING (
    member_id IN (
      SELECT id FROM members 
      WHERE email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "Members can insert their own activity" 
  ON member_activity FOR INSERT 
  WITH CHECK (
    member_id IN (
      SELECT id FROM members 
      WHERE email = auth.jwt()->>'email'
    )
  );

-- Stripe data policies (only own data)
CREATE POLICY "Members can view their own stripe data" 
  ON stripe_customers FOR SELECT 
  USING (
    member_id IN (
      SELECT id FROM members 
      WHERE email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "Members can view their own subscriptions" 
  ON stripe_subscriptions FOR SELECT 
  USING (
    member_id IN (
      SELECT id FROM members 
      WHERE email = auth.jwt()->>'email'
    )
  );

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to members table
CREATE TRIGGER update_members_updated_at 
  BEFORE UPDATE ON members 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Function to get member by email (for magic link auth)
CREATE OR REPLACE FUNCTION get_member_by_email(member_email TEXT)
RETURNS TABLE (
  id UUID,
  first_name TEXT,
  last_name TEXT,
  display_name TEXT,
  email TEXT,
  membership_type TEXT,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.first_name,
    m.last_name,
    m.display_name,
    m.email,
    m.membership_type,
    m.is_active
  FROM members m
  WHERE m.email = member_email AND m.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update last login
CREATE OR REPLACE FUNCTION update_member_last_login(member_email TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE members 
  SET last_login = NOW() 
  WHERE email = member_email;
  
  -- Log the login activity
  INSERT INTO member_activity (member_id, activity_type, activity_data)
  SELECT id, 'login', jsonb_build_object('timestamp', NOW())
  FROM members 
  WHERE email = member_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- VIEWS FOR COMMON QUERIES
-- =============================================

-- Public members view (for directory)
CREATE VIEW public_members AS
SELECT 
  m.id,
  m.member_number,
  m.first_name,
  m.last_name,
  m.display_name,
  m.email,
  m.company,
  m.main_profession,
  m.other_professions,
  m.years_experience,
  m.biography,
  m.province,
  m.autonomous_community,
  m.social_media,
  m.profile_image_url,
  m.membership_type,
  m.created_at,
  -- Aggregate categories
  array_agg(
    CASE WHEN mc.category_type = 'profession' 
    THEN mc.category_name END
  ) FILTER (WHERE mc.category_type = 'profession') AS professions,
  array_agg(
    CASE WHEN mc.category_type = 'other_profession' 
    THEN mc.category_name END
  ) FILTER (WHERE mc.category_type = 'other_profession') AS specializations
FROM members m
LEFT JOIN member_categories mc ON m.id = mc.member_id
WHERE m.is_active = true AND m.privacy_level = 'public'
GROUP BY m.id, m.member_number, m.first_name, m.last_name, m.display_name, 
         m.email, m.company, m.main_profession, m.other_professions, 
         m.years_experience, m.biography, m.province, m.autonomous_community, 
         m.social_media, m.profile_image_url, m.membership_type, m.created_at;

-- Board members view
CREATE VIEW board_members AS
SELECT 
  m.*,
  array_agg(mc.category_name) FILTER (WHERE mc.category_type = 'board_role') AS board_roles
FROM members m
LEFT JOIN member_categories mc ON m.id = mc.member_id
WHERE m.is_board_member = true AND m.is_active = true
GROUP BY m.id;

-- =============================================
-- INITIAL DATA SETUP
-- =============================================

-- Insert some test data (will be replaced by migration script)
INSERT INTO members (
  first_name, last_name, email, membership_type, is_active
) VALUES 
  ('Test', 'Admin', 'admin@mia-animation.com', 'admin', true)
ON CONFLICT (email) DO NOTHING;
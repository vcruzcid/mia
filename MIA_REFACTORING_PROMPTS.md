# MIA React App Complete Refactoring - Execution Prompts

## Project Overview
This document contains all the prompts needed to execute the MIA React App refactoring and database simplification. The goal is to create a modern, performant React website for Mujeres en la Industria de la Animación with simplified Stripe-centric database.

## Execution Status
- [ ] Phase 1: MCP Testing & Database Analysis
- [ ] Phase 2: Database Schema Simplification  
- [ ] Phase 3: Safe Data Migration
- [ ] Phase 4: Business Logic Implementation
- [ ] Phase 5: Frontend Integration
- [ ] Phase 6: Testing & Validation

---

## Phase 1: MCP Testing & Database Analysis

### 1.1 Test Supabase MCP Connection
**Status**: ⚠️ Issues Found  
**Prompt**:
```
Test Supabase MCP connection using PAT from .env.local: ***REMOVED***. If MCP auth fails, manually set SUPABASE_ACCESS_TOKEN environment variable and test basic query: SELECT 1 as test, NOW() as timestamp;
```
**Expected Outcome**: Working MCP connection to Supabase database  
**Documentation**: 
- ⚠️ MCP Server authentication issue: Token not being picked up properly
- ❌ Direct psql connection failing: Host resolution and tenant issues
- 🔄 Need to troubleshoot database connection URL and authentication
- ✅ Serena MCP working correctly for code analysis  

### 1.2 Analyze Current Database State
**Status**: ✅ Completed  
**Prompt**:
```
Once MCP works, analyze current database state. List all tables (\dt), check existing member data structure, identify what survived from phases 1-2 migration. Show sample data to understand current schema.
```
**Expected Outcome**: Complete understanding of current database structure after partial migration  
**Documentation**: 
- ✅ Current Member interface has 60+ fields including survey data
- ✅ Service layer already expecting views: public_members, board_members, member_stripe_data
- ✅ Fallback logic exists for missing views/tables
- ✅ SociasPage uses Zustand store with comprehensive filtering
- ✅ Gallery store maps fields for backwards compatibility
- ⚠️ Current system shows RLS policy infinite recursion issue in logs  

### 1.3 Inventory All Current Fields
**Status**: ✅ Completed  
**Prompt**:
```
Query existing member data to identify ALL fields that contain actual data (not just schema fields). Create comprehensive field inventory showing: field names, data types, non-null counts, sample values. This ensures we preserve all current data in the new simplified schema.
```
**Expected Outcome**: Complete field inventory for migration planning  
**Documentation**: 
**FIELDS TO PRESERVE (Core Data)**:
- ✅ id, email, first_name, last_name, display_name, member_number
- ✅ phone, address, postal_code, province, autonomous_community, country
- ✅ main_profession, other_professions[], professional_role, company, years_experience
- ✅ biography, employment_status, education_level, studies_completed, educational_institution
- ✅ membership_type, is_board_member, board_position, is_active
- ✅ accepts_newsletter, accepts_job_offers, gdpr_accepted, privacy_level
- ✅ social_media{}, profile_image_url, cv_document_url, birth_date, other_associations[]
- ✅ stripe_customer_id (REQUIRED), created_at, updated_at, last_login

**FIELDS TO REMOVE (Survey Data)**:
- ❌ personal_situation, has_children, work_life_balance
- ❌ experienced_gender_discrimination, experienced_salary_discrimination
- ❌ experienced_sexual_harassment, experienced_sexual_abuse  
- ❌ experienced_glass_ceiling, experienced_inequality_episode
- ❌ salary_range (sensitive data)

**STRIPE REQUIREMENTS**:
- ✅ stripe_customer_id REQUIRED (every member must have)
- ✅ Active status = stripe_subscription_status = 'active'
- ✅ Address fields REQUIRED for billing  

---

## Phase 2: Database Schema Simplification

### 2.1 Create Super-Simple Members Table (Stripe Required)
**Status**: 🔄 Pending  
**Prompt**:
```
Create the super-simplified members table with Stripe-centric design. Requirements:
- stripe_customer_id REQUIRED for all members
- Remove ALL survey fields (discrimination questions, personal situation, etc.)
- Address fields REQUIRED for Stripe billing (address, city, country)
- membership_type required ('profesional', 'estudiante', 'colaborador')
- Active status determined by stripe_subscription_status = 'active'
- Minimal constraints to avoid migration failures
- Include proper indexes for performance

CREATE TABLE members_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  display_name TEXT,
  member_number TEXT UNIQUE,
  phone TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT,
  province TEXT,
  autonomous_community TEXT,
  country TEXT NOT NULL DEFAULT 'Spain',
  main_profession TEXT,
  other_professions TEXT[],
  professional_role TEXT,
  company TEXT,
  years_experience INTEGER,
  biography TEXT,
  employment_status TEXT,
  education_level TEXT,
  studies_completed TEXT,
  educational_institution TEXT,
  is_student BOOLEAN DEFAULT false,
  membership_type TEXT NOT NULL,
  stripe_customer_id TEXT UNIQUE NOT NULL,
  stripe_subscription_id TEXT,
  stripe_subscription_status TEXT,
  subscription_current_period_end TIMESTAMPTZ,
  is_board_member BOOLEAN DEFAULT false,
  board_position TEXT,
  board_term_start DATE,
  board_term_end DATE,
  accepts_newsletter BOOLEAN DEFAULT true,
  accepts_job_offers BOOLEAN DEFAULT false,
  privacy_level TEXT DEFAULT 'public',
  gdpr_accepted BOOLEAN DEFAULT true,
  social_media JSONB DEFAULT '{}',
  profile_image_url TEXT,
  cv_document_url TEXT,
  birth_date DATE,
  other_associations TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);
```
**Expected Outcome**: New simplified members table created successfully  
**Documentation**: Schema changes, field mappings, constraint decisions  

### 2.2 Create Business Logic Views
**Status**: 🔄 Pending  
**Prompt**:
```
Create simplified views for frontend use based on Stripe-centric business logic:

-- Active members = those with active Stripe subscriptions
CREATE VIEW active_members AS
SELECT * FROM members_new 
WHERE stripe_subscription_status = 'active';

-- Public members for Socias page
CREATE VIEW public_members AS
SELECT * FROM members_new 
WHERE stripe_subscription_status = 'active' 
AND privacy_level = 'public';

-- Board members for Directiva page  
CREATE VIEW board_members AS
SELECT * FROM members_new
WHERE is_board_member = true
AND (board_term_end IS NULL OR board_term_end > CURRENT_DATE);

-- Member statistics
CREATE VIEW member_stats AS
SELECT 
  COUNT(*) as total_members,
  COUNT(*) FILTER (WHERE stripe_subscription_status = 'active') as active_members,
  COUNT(*) FILTER (WHERE is_board_member = true) as board_members,
  COUNT(*) FILTER (WHERE membership_type = 'profesional') as professional_members,
  COUNT(*) FILTER (WHERE membership_type = 'estudiante') as student_members,
  COUNT(*) FILTER (WHERE membership_type = 'colaborador') as collaborator_members;
```
**Expected Outcome**: Views created for different use cases  
**Documentation**: View definitions and business logic rules  

---

## Phase 3: Safe Data Migration

### 3.1 Analyze Stripe Integration Status
**Status**: 🔄 Pending  
**Prompt**:
```
Analyze existing member data to understand Stripe integration status. Count how many members have stripe_customer_id, check subscription statuses, identify members without Stripe data who need placeholder/pending Stripe customers created. Create report showing:
- Total members in current table
- Members with existing stripe_customer_id
- Members needing Stripe placeholder creation
- Current subscription status distribution
- Data quality issues that need addressing
```
**Expected Outcome**: Stripe integration assessment report  
**Documentation**: Migration planning data, Stripe status analysis  

### 3.2 Execute Safe Data Migration
**Status**: 🔄 Pending  
**Prompt**:
```
Execute safe migration to members_new table with these steps:
1. Create backup: CREATE TABLE members_backup AS SELECT * FROM members;
2. For members without stripe_customer_id, create placeholder format like 'pending_stripe_[uuid]'
3. Migrate ALL existing fields (except survey fields which should be completely removed)
4. Ensure all Stripe-required and address-required fields have values (use defaults like 'Pending Address' if needed)
5. Clean/normalize data during migration: trim text, handle NULLs, standardize arrays
6. Remove survey fields completely: personal_situation, has_children, work_life_balance, all discrimination questions
7. Create migration report showing success/failure counts and any data issues

Log all data transformations and create comprehensive migration report.
```
**Expected Outcome**: All existing data migrated to new schema (minus survey fields)  
**Documentation**: Migration execution log, data transformation report, success metrics  

### 3.3 Sync with Stripe Data
**Status**: 🔄 Pending  
**Prompt**:
```
After migration, sync with actual Stripe data using existing Stripe Foreign Data Wrapper. Update real stripe_customer_ids and subscription statuses from Stripe API. Create comprehensive sync report showing:
- Members with real Stripe customers vs placeholders
- Subscription status updates from Stripe
- Members needing real Stripe customer creation
- Any sync errors or data mismatches

Use existing Stripe FDW tables to update member data with real Stripe information.
```
**Expected Outcome**: Member data synchronized with Stripe  
**Documentation**: Stripe sync report, data accuracy assessment  

---

## Phase 4: Business Logic Implementation

### 4.1 Create Stripe-Based Status Functions
**Status**: 🔄 Pending  
**Prompt**:
```
Create database functions to manage Stripe-based member status:

-- Function to sync member status with Stripe
CREATE OR REPLACE FUNCTION sync_member_stripe_status(member_email TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE members_new 
  SET stripe_subscription_status = (
    SELECT status FROM stripe.subscriptions 
    WHERE customer = (SELECT stripe_customer_id FROM members_new WHERE email = member_email)
    ORDER BY created DESC LIMIT 1
  ),
  updated_at = NOW()
  WHERE email = member_email;
END;
$$ LANGUAGE plpgsql;

-- Function to get active member count
CREATE OR REPLACE FUNCTION get_active_member_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM members_new WHERE stripe_subscription_status = 'active');
END;
$$ LANGUAGE plpgsql;

-- Function to update member subscription from Stripe webhook
CREATE OR REPLACE FUNCTION update_member_subscription(
  stripe_customer_id_param TEXT,
  subscription_status TEXT,
  subscription_id TEXT,
  current_period_end TIMESTAMPTZ
)
RETURNS VOID AS $$
BEGIN
  UPDATE members_new 
  SET 
    stripe_subscription_status = subscription_status,
    stripe_subscription_id = subscription_id,
    subscription_current_period_end = current_period_end,
    updated_at = NOW()
  WHERE stripe_customer_id = stripe_customer_id_param;
END;
$$ LANGUAGE plpgsql;
```
**Expected Outcome**: Database functions for Stripe integration  
**Documentation**: Function specifications, business logic rules  

### 4.2 Create Member Management Functions
**Status**: 🔄 Pending  
**Prompt**:
```
Create helper functions for member management:

-- Get member by email
CREATE OR REPLACE FUNCTION get_member_by_email(member_email TEXT)
RETURNS TABLE(
  id UUID,
  first_name TEXT,
  last_name TEXT,
  membership_type TEXT,
  stripe_subscription_status TEXT,
  is_board_member BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT m.id, m.first_name, m.last_name, m.membership_type, m.stripe_subscription_status, m.is_board_member
  FROM members_new m
  WHERE m.email = member_email;
END;
$$ LANGUAGE plpgsql;

-- Update member last login
CREATE OR REPLACE FUNCTION update_member_last_login(member_email TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE members_new 
  SET last_login = NOW(), updated_at = NOW()
  WHERE email = member_email;
END;
$$ LANGUAGE plpgsql;

-- Get member statistics
CREATE OR REPLACE FUNCTION get_member_statistics()
RETURNS TABLE(
  total_members BIGINT,
  active_members BIGINT,
  board_members BIGINT,
  professional_members BIGINT,
  student_members BIGINT,
  collaborator_members BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM member_stats;
END;
$$ LANGUAGE plpgsql;
```
**Expected Outcome**: Complete set of member management functions  
**Documentation**: Function usage guide, API specifications  

---

## Phase 5: Frontend Integration

### 5.1 Update TypeScript Types
**Status**: 🔄 Pending  
**Prompt**:
```
Update src/types/supabase.ts to match new schema. Requirements:
- Make stripe_customer_id required
- Remove all survey fields completely
- Ensure membership status is computed from stripe_subscription_status
- Address fields required for Stripe integration
- Update all interfaces to reflect Stripe-centric approach

Create new interface that matches members_new table exactly, ensuring type safety across the application.
```
**Expected Outcome**: Updated TypeScript types matching new schema  
**Documentation**: Type definitions, interface changes, breaking changes log  

### 5.2 Update Service Functions
**Status**: 🔄 Pending  
**Prompt**:
```
Update src/services/supabaseService.ts to use new views and schema:
- getPublicMembers() uses public_members view (active + public privacy)
- getBoardMembers() uses board_members view (current board members)
- getActiveMembers() uses active_members view (all active subscribers)
- getMemberStats() uses member_stats view
- All queries respect Stripe-based active status logic
- Update authentication functions to work with new member structure
- Ensure all CRUD operations work with simplified schema
```
**Expected Outcome**: Updated service functions working with new schema  
**Documentation**: Service function changes, API updates, migration notes  

### 5.3 Update Authentication Context
**Status**: 🔄 Pending  
**Prompt**:
```
Update src/contexts/AuthContext.tsx to work with new member schema:
- Ensure magic link authentication works with simplified member structure  
- Update member profile loading to use new fields
- Handle Stripe subscription status in auth state
- Update member registration flow to require Stripe integration
- Test login/logout flow with new database structure
```
**Expected Outcome**: Authentication working with new member schema  
**Documentation**: Auth flow changes, member profile updates  

---

## Phase 6: Page Updates & Testing

### 6.1 Update SociasPage
**Status**: 🔄 Pending  
**Prompt**:
```
Update src/pages/SociasPage.tsx to use new database structure:
- Use public_members view (shows active subscribers with public privacy)
- Update member card display to use simplified fields
- Ensure member filtering works (profession, location, experience)
- Add loading states and error handling
- Test responsive design and card layouts
- Verify member images and bio display correctly
```
**Expected Outcome**: SociasPage showing active public members  
**Documentation**: Page functionality verification, UI/UX updates  

### 6.2 Update DirectivaPage
**Status**: 🔄 Pending  
**Prompt**:
```
Update src/pages/DirectivaPage.tsx to use new board member structure:
- Use board_members view (shows current board with active terms)
- Display board positions and terms correctly
- Show board member hierarchy if position_order exists
- Update board member cards with new field structure
- Ensure board member images and bios display properly
- Test board member term display and current status
```
**Expected Outcome**: DirectivaPage showing current board members  
**Documentation**: Board member display verification, term management notes  

### 6.3 Update PortalPage
**Status**: 🔄 Pending  
**Prompt**:
```
Update member portal (src/pages/PortalPage.tsx) for new schema:
- Allow members to update profile using new simplified fields
- Show Stripe subscription status and membership type
- Enable address updates (required for Stripe)
- Professional information updates (main_profession, company, etc.)
- Privacy level controls (public, members-only, private)
- Remove all survey field forms completely
- Add subscription management info display
- Test form validation with new required fields
```
**Expected Outcome**: Member portal working with simplified schema  
**Documentation**: Portal functionality guide, form validation updates  

### 6.4 Create Admin Dashboard (New)
**Status**: 🔄 Pending  
**Prompt**:
```
Create new admin dashboard (src/pages/AdminPage.tsx):
- Display member statistics using member_stats view
- Show active vs inactive members (based on Stripe subscriptions)
- Board member management: assign/remove board positions and terms
- Member data export functionality
- Stripe subscription status monitoring
- Member search and filtering
- Basic member profile management for admins
- No member approval system needed - focus on board management
```
**Expected Outcome**: Complete admin dashboard for member and board management  
**Documentation**: Admin features guide, role-based access documentation  

---

## Phase 7: Testing & Validation

### 7.1 Database Testing
**Status**: 🔄 Pending  
**Prompt**:
```
Comprehensive database testing:
- Test all views return expected data (public_members, board_members, active_members)
- Verify all functions work correctly (sync functions, member management)
- Test data integrity after migration
- Validate Stripe integration is working
- Check performance of queries and views
- Test RLS policies if implemented
- Create database health check report
```
**Expected Outcome**: All database functionality validated  
**Documentation**: Database testing report, performance metrics  

### 7.2 Frontend Integration Testing
**Status**: 🔄 Pending  
**Prompt**:
```
Test all pages with new database:
- SociasPage displays active public members correctly
- DirectivaPage shows current board members
- PortalPage allows profile updates
- AdminPage provides full member management
- Authentication flow works end-to-end
- Magic link login functions properly
- Member registration creates proper Stripe integration
- All forms validate correctly with new schema
```
**Expected Outcome**: All frontend pages working with new backend  
**Documentation**: Integration testing report, functionality verification  

### 7.3 Performance & UX Testing
**Status**: 🔄 Pending  
**Prompt**:
```
Performance and user experience testing:
- Page load times under 2 seconds
- Member galleries load smoothly with proper pagination
- Mobile responsive design works correctly
- Loading states and error handling work properly
- Accessibility compliance verification
- Cross-browser testing
- Image loading optimization
- Search and filter performance
```
**Expected Outcome**: Optimized performance and excellent UX  
**Documentation**: Performance metrics, UX testing results  

---

## Phase 8: Deployment & Cleanup

### 8.1 Production Deployment
**Status**: 🔄 Pending  
**Prompt**:
```
Prepare for production deployment:
- Update environment variables for production
- Test database migrations on staging
- Verify all MCP connections work in production
- Test Stripe webhooks and integration
- Update CI/CD pipeline for new schema
- Create deployment checklist
- Test backup and restore procedures
```
**Expected Outcome**: Application ready for production deployment  
**Documentation**: Deployment guide, production configuration  

### 8.2 Final Cleanup & Documentation
**Status**: 🔄 Pending  
**Prompt**:
```
Final cleanup and documentation:
- Remove unused code and dependencies
- Clean up database (drop old tables if migration successful)
- Update project README with new architecture
- Document API changes and new features
- Create user guide for admin dashboard
- Update development setup instructions
- Create maintenance and monitoring procedures
```
**Expected Outcome**: Clean, documented, maintainable codebase  
**Documentation**: Complete project documentation, maintenance guide  

---

## Success Criteria

### Database
- ✅ All member data preserved (minus survey fields)
- ✅ Every member has Stripe customer ID
- ✅ Active status = Active Stripe subscription
- ✅ No migration constraint failures
- ✅ All views and functions working

### Frontend
- ✅ SociasPage shows active public members
- ✅ DirectivaPage shows current board
- ✅ Member portal enables profile management
- ✅ Admin dashboard provides full management
- ✅ Authentication flow works seamlessly

### Performance
- ✅ Page load times < 2 seconds
- ✅ Mobile responsive design
- ✅ Proper error handling
- ✅ Optimized queries and views
- ✅ Accessibility compliance

### Integration
- ✅ Stripe subscription sync working
- ✅ Magic link authentication functional  
- ✅ All MCP connections stable
- ✅ Production deployment ready
- ✅ Comprehensive documentation

---

## Execution Notes

**Start Date**: [To be filled]  
**Estimated Duration**: 8-12 hours  
**Priority**: High - Critical for website functionality  
**Dependencies**: Supabase MCP connection, existing database access

**Next Steps**: Begin with Phase 1 prompt execution, update this document with results and status as each phase completes.
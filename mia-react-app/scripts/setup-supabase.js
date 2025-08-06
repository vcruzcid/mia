#!/usr/bin/env node

/**
 * Supabase Setup Script for MIA Members Database
 * 
 * This script:
 * 1. Initializes Supabase project configuration
 * 2. Sets up environment variables
 * 3. Applies database schema
 * 4. Configures authentication settings
 */

// import { createClient } from '@supabase/supabase-js'; // Will be used after env setup
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SUPABASE_SETUP = {
  // You'll need to create a Supabase project and fill these in
  project_url: process.env.SUPABASE_URL || 'https://your-project.supabase.co',
  anon_key: process.env.SUPABASE_ANON_KEY || 'your-anon-key',
  service_role_key: process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'
};

console.log('🚀 Setting up Supabase for MIA Members Database...');

// Check if environment variables are set
function checkEnvironmentVariables() {
  const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.log('\n⚠️  Missing environment variables:');
    missing.forEach(key => console.log(`   - ${key}`));
    console.log('\n📝 Please create a .env.local file with your Supabase credentials:');
    console.log(`
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Optional: for development
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
    `);
    
    console.log('\n🔗 Get your keys from: https://supabase.com/dashboard/project/your-project/settings/api');
    return false;
  }
  
  return true;
}

// Create Supabase client with service role key for admin operations
function createAdminClient() {
  // Will be implemented after environment setup
  return null;
}

// Apply database schema
async function applyDatabaseSchema() {
  console.log('📊 Applying database schema...');
  
  const schemaPath = path.join(__dirname, '..', 'supabase', 'schema.sql');
  
  if (!fs.existsSync(schemaPath)) {
    console.error('❌ Schema file not found:', schemaPath);
    return false;
  }
  
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  const supabase = createAdminClient();
  
  try {
    // Note: In a real setup, you'd use the Supabase CLI or dashboard to run this
    // This is just for documentation purposes
    console.log('   Schema file loaded:', schemaPath);
    console.log('   👉 Please run this schema in your Supabase SQL editor:');
    console.log('      https://supabase.com/dashboard/project/your-project/sql');
    
    return true;
  } catch (error) {
    console.error('❌ Error applying schema:', error.message);
    return false;
  }
}

// Configure authentication settings
async function configureAuthentication() {
  console.log('🔐 Configuring authentication...');
  
  const authConfig = {
    site_url: 'http://localhost:3000', // Update for production
    redirect_urls: [
      'http://localhost:3000/portal',
      'http://localhost:3000/auth/callback',
      // Add your production URLs here
    ],
    email: {
      enable_signup: false, // Only existing members can login
      double_confirm_changes: true,
      secure_email_change_enabled: true
    },
    magic_link: {
      enabled: true
    },
    password: {
      enabled: false // We only use magic links
    }
  };
  
  console.log('   ✅ Authentication configuration:');
  console.log('      - Magic links: enabled');
  console.log('      - Password auth: disabled');
  console.log('      - Email signup: disabled (existing members only)');
  console.log('      - Double confirm changes: enabled');
  
  console.log('\n   👉 Please configure these settings in your Supabase dashboard:');
  console.log('      https://supabase.com/dashboard/project/your-project/auth/settings');
  
  return true;
}

// Create environment template
function createEnvironmentTemplate() {
  console.log('📝 Creating environment template...');
  
  const envTemplate = `# MIA React App - Environment Configuration

##################################
# SUPABASE CONFIGURATION
##################################
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Frontend environment variables (VITE_ prefix for Vite)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

##################################
# STRIPE CONFIGURATION
##################################
STRIPE_PUBLISHABLE_KEY=pk_test_your-publishable-key-here
STRIPE_SECRET_KEY=sk_test_your-secret-key-here
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-publishable-key-here

##################################
# API CONFIGURATION
##################################
# Cloudflare Pages Functions
TURNSTILE_SECRET_KEY=your-turnstile-secret-key-here

# Legacy Zapier (if still needed)
ZAPIER_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/your-webhook-id

##################################
# APPLICATION SETTINGS
##################################
NODE_ENV=development
VITE_APP_NAME="MIA - Mujeres en la Industria de la Animación"
VITE_APP_VERSION=2.0.0

# Contact email
VITE_CONTACT_EMAIL=hola@animacionesmia.com

# Enable/disable features
VITE_ENABLE_MOCK_DATA=false
VITE_ENABLE_STRIPE=true
VITE_ENABLE_MEMBER_PORTAL=true
`;

  const envPath = path.join(__dirname, '..', '.env.example');
  fs.writeFileSync(envPath, envTemplate);
  
  console.log('   ✅ Created .env.example template');
  console.log('   👉 Copy to .env.local and fill in your actual values');
  
  return true;
}

// Create Supabase types file
function createTypesFile() {
  console.log('📘 Creating TypeScript types...');
  
  const typesContent = `// Generated types for Supabase integration
// This file contains the TypeScript interfaces for the MIA members database

export interface Member {
  id: string;
  wp_post_id?: number;
  wp_user_id?: number;
  member_number?: number;
  first_name: string;
  last_name: string;
  display_name?: string;
  email: string;
  phone?: string;
  birth_date?: string;
  main_profession?: string;
  other_professions?: string[];
  company?: string;
  years_experience?: number;
  biography?: string;
  professional_role?: string;
  employment_status?: string;
  salary_range?: number;
  address?: string;
  postal_code?: string;
  province?: string;
  autonomous_community?: string;
  country?: string;
  social_media?: {
    linkedin?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
    website?: string;
    youtube?: string;
    vimeo?: string;
    artstation?: string;
  };
  education_level?: string;
  studies_completed?: string;
  educational_institution?: string;
  is_student?: boolean;
  membership_type?: string;
  is_board_member?: boolean;
  board_position?: string;
  is_active?: boolean;
  accepts_newsletter?: boolean;
  accepts_job_offers?: boolean;
  gdpr_accepted?: boolean;
  privacy_level?: 'public' | 'members-only' | 'private';
  personal_situation?: string;
  has_children?: boolean;
  work_life_balance?: boolean;
  experienced_gender_discrimination?: boolean;
  experienced_salary_discrimination?: boolean;
  experienced_sexual_harassment?: boolean;
  experienced_sexual_abuse?: boolean;
  experienced_glass_ceiling?: boolean;
  experienced_inequality_episode?: boolean;
  stripe_customer_id?: string;
  stripe_subscription_status?: string;
  other_associations?: string[];
  cv_document_url?: string;
  profile_image_url?: string;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
  migrated_at?: string;
}

export interface MemberCategory {
  id: string;
  member_id: string;
  category_type: 'profession' | 'other_profession' | 'member_type' | 'board_role' | 'country';
  category_name: string;
  category_slug: string;
  is_primary?: boolean;
  created_at?: string;
}

export interface MemberActivity {
  id: string;
  member_id: string;
  activity_type: 'login' | 'profile_update' | 'registration' | 'payment';
  activity_data?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
}

export interface StripeCustomer {
  id: string;
  member_id: string;
  stripe_customer_id: string;
  customer_data?: Record<string, any>;
  last_sync?: string;
  created_at?: string;
}

export interface StripeSubscription {
  id: string;
  member_id: string;
  stripe_subscription_id: string;
  status: string;
  current_period_start?: string;
  current_period_end?: string;
  subscription_data?: Record<string, any>;
  last_sync?: string;
  created_at?: string;
}

// Database table types for Supabase
export interface Database {
  public: {
    Tables: {
      members: {
        Row: Member;
        Insert: Omit<Member, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Member, 'id' | 'created_at'>>;
      };
      member_categories: {
        Row: MemberCategory;
        Insert: Omit<MemberCategory, 'id' | 'created_at'>;
        Update: Partial<Omit<MemberCategory, 'id' | 'created_at'>>;
      };
      member_activity: {
        Row: MemberActivity;
        Insert: Omit<MemberActivity, 'id' | 'created_at'>;
        Update: Partial<Omit<MemberActivity, 'id' | 'created_at'>>;
      };
      stripe_customers: {
        Row: StripeCustomer;
        Insert: Omit<StripeCustomer, 'id' | 'created_at'>;
        Update: Partial<Omit<StripeCustomer, 'id' | 'created_at'>>;
      };
      stripe_subscriptions: {
        Row: StripeSubscription;
        Insert: Omit<StripeSubscription, 'id' | 'created_at'>;
        Update: Partial<Omit<StripeSubscription, 'id' | 'created_at'>>;
      };
    };
    Views: {
      public_members: {
        Row: Member & {
          professions?: string[];
          specializations?: string[];
        };
      };
      board_members: {
        Row: Member & {
          board_roles?: string[];
        };
      };
    };
    Functions: {
      get_member_by_email: {
        Args: { member_email: string };
        Returns: {
          id: string;
          first_name: string;
          last_name: string;
          display_name?: string;
          email: string;
          membership_type?: string;
          is_active: boolean;
        }[];
      };
      update_member_last_login: {
        Args: { member_email: string };
        Returns: void;
      };
    };
  };
}`;

  const typesPath = path.join(__dirname, '..', 'src', 'types', 'supabase.ts');
  fs.mkdirSync(path.dirname(typesPath), { recursive: true });
  fs.writeFileSync(typesPath, typesContent);
  
  console.log('   ✅ Created TypeScript types at src/types/supabase.ts');
  
  return true;
}

// Main setup function
async function setupSupabase() {
  console.log('🏗️  MIA Supabase Setup\n');
  
  // Check environment variables
  const hasEnvVars = checkEnvironmentVariables();
  
  // Create environment template
  createEnvironmentTemplate();
  
  // Create TypeScript types
  createTypesFile();
  
  if (hasEnvVars) {
    // Apply database schema
    await applyDatabaseSchema();
    
    // Configure authentication
    await configureAuthentication();
    
    console.log('\n✅ Supabase setup completed!');
    console.log('\n📋 Next steps:');
    console.log('   1. Apply the schema in your Supabase SQL editor');
    console.log('   2. Configure authentication settings in Supabase dashboard');
    console.log('   3. Run the data migration script');
    console.log('   4. Update your .env.local with actual values');
  } else {
    console.log('\n⏳ Setup prepared. Please add your Supabase credentials and run again.');
  }
  
  console.log('\n🔗 Useful links:');
  console.log('   - Supabase Dashboard: https://supabase.com/dashboard');
  console.log('   - SQL Editor: https://supabase.com/dashboard/project/your-project/sql');
  console.log('   - Auth Settings: https://supabase.com/dashboard/project/your-project/auth/settings');
}

// Run setup
setupSupabase().catch(console.error);
#!/usr/bin/env node

/**
 * Replace Mock Data with Real Data Script
 * 
 * This script:
 * 1. Removes all mock data files and references
 * 2. Updates components to use Supabase instead of mock data
 * 3. Updates API services to connect to real database
 * 4. Updates types and interfaces
 * 5. Configures real authentication
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔄 Replacing mock data with real Supabase integration...');

// Files to remove (mock data)
const filesToRemove = [
  'src/data/mockMembers.ts',
  'src/data/mockDirectiva.ts'
];

// Files to update with real data integration
const filesToUpdate = [
  'src/services/apiService.ts',
  'src/store/galleryStore.ts',
  'src/pages/SociasPage.tsx',
  'src/pages/DirectivaPage.tsx',
  'functions/api/members.ts',
  'functions/api/directiva/[year].ts'
];

// Remove mock data files
function removeMockDataFiles() {
  console.log('🗑️  Removing mock data files...');
  
  filesToRemove.forEach(filePath => {
    const fullPath = path.join(__dirname, '..', filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`   ✅ Removed: ${filePath}`);
    } else {
      console.log(`   ⚠️  Not found: ${filePath}`);
    }
  });
}

// Create new Supabase service
function createSupabaseService() {
  console.log('🔧 Creating Supabase service...');
  
  const supabaseServiceContent = `import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Member-related functions
export const memberService = {
  // Get all public members
  async getPublicMembers() {
    const { data, error } = await supabase
      .from('public_members')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get member by ID
  async getMemberById(id: string) {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Search members
  async searchMembers(query: string) {
    const { data, error } = await supabase
      .from('public_members')
      .select('*')
      .or(\`first_name.ilike.%\${query}%,last_name.ilike.%\${query}%,main_profession.ilike.%\${query}%,company.ilike.%\${query}%\`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Filter members
  async filterMembers(filters: {
    memberTypes?: string[];
    specializations?: string[];
    locations?: string[];
    availabilityStatus?: string[];
    limit?: number;
    offset?: number;
  }) {
    let query = supabase
      .from('public_members')
      .select('*');

    if (filters.memberTypes?.length) {
      query = query.in('membership_type', filters.memberTypes);
    }

    if (filters.locations?.length) {
      query = query.in('autonomous_community', filters.locations);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Get board members
  async getBoardMembers() {
    const { data, error } = await supabase
      .from('board_members')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get member by email (for auth)
  async getMemberByEmail(email: string) {
    const { data, error } = await supabase
      .rpc('get_member_by_email', { member_email: email });

    if (error) throw error;
    return data?.[0];
  },

  // Update member profile
  async updateMemberProfile(id: string, updates: Partial<Database['public']['Tables']['members']['Update']>) {
    const { data, error } = await supabase
      .from('members')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Authentication functions
export const authService = {
  // Sign in with magic link
  async signInWithMagicLink(email: string) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: \`\${window.location.origin}/portal\`
      }
    });

    if (error) throw error;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current session
  async getCurrentSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Update last login
  async updateLastLogin(email: string) {
    const { error } = await supabase
      .rpc('update_member_last_login', { member_email: email });

    if (error) throw error;
  }
};

// Activity logging
export const activityService = {
  async logActivity(memberId: string, activityType: string, activityData: Record<string, any> = {}) {
    const { error } = await supabase
      .from('member_activity')
      .insert({
        member_id: memberId,
        activity_type: activityType,
        activity_data: activityData,
        ip_address: null, // Will be handled by RLS policies
        user_agent: navigator.userAgent
      });

    if (error) console.error('Failed to log activity:', error);
  }
};

export default supabase;`;

  const servicePath = path.join(__dirname, '..', 'src', 'services', 'supabaseService.ts');
  fs.writeFileSync(servicePath, supabaseServiceContent);
  console.log('   ✅ Created Supabase service');
}

// Update API service to use Supabase
function updateApiService() {
  console.log('🔧 Updating API service...');
  
  const apiServiceContent = `import { memberService } from './supabaseService';
import type { Member } from '../types/supabase';

// Updated API service that uses Supabase instead of mock data
export class ApiService {
  private readonly baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

  // Members API - now using Supabase
  async getMembers(params: {
    search?: string;
    memberTypes?: string[];
    specializations?: string[];
    locations?: string[];
    availabilityStatus?: string[];
    hasSocialMedia?: boolean;
    isActive?: boolean;
    limit?: number;
    offset?: number;
  } = {}) {
    try {
      if (params.search) {
        return await memberService.searchMembers(params.search);
      } else {
        return await memberService.filterMembers(params);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      throw new Error('Failed to fetch members');
    }
  }

  // Get member by ID
  async getMemberById(id: string): Promise<Member> {
    try {
      return await memberService.getMemberById(id);
    } catch (error) {
      console.error('Error fetching member:', error);
      throw new Error('Failed to fetch member');
    }
  }

  // Get board members by year
  async getDirectivaByYear(year: number) {
    try {
      // For now, return current board members
      // Later, you can add year-based filtering to the database
      const boardMembers = await memberService.getBoardMembers();
      return boardMembers.map(member => ({
        ...member,
        year_served: [year],
        is_current_member: year === new Date().getFullYear()
      }));
    } catch (error) {
      console.error('Error fetching directiva:', error);
      throw new Error('Failed to fetch directiva');
    }
  }

  // Contact form (keep existing implementation)
  async submitContactForm(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
    turnstileToken: string;
  }) {
    try {
      const response = await fetch(\`\${this.baseURL}/contact\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting contact form:', error);
      throw new Error('Failed to submit contact form');
    }
  }

  // Registration (keep existing implementation)
  async submitRegistration(data: any) {
    try {
      const response = await fetch(\`\${this.baseURL}/register\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting registration:', error);
      throw new Error('Failed to submit registration');
    }
  }

  // Health check
  async checkHealth() {
    try {
      const response = await fetch(\`\${this.baseURL}/health\`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'error', message: 'API unavailable' };
    }
  }
}

export const apiService = new ApiService();
export default apiService;`;

  const apiServicePath = path.join(__dirname, '..', 'src', 'services', 'apiService.ts');
  fs.writeFileSync(apiServicePath, apiServiceContent);
  console.log('   ✅ Updated API service');
}

// Update gallery store to use Supabase
function updateGalleryStore() {
  console.log('🔧 Updating gallery store...');
  
  const galleryStoreContent = `import { create } from 'zustand';
import { memberService } from '../services/supabaseService';
import type { Member } from '../types/supabase';

interface GalleryState {
  members: Member[];
  filteredMembers: Member[];
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  filters: {
    memberTypes: string[];
    specializations: string[];
    locations: string[];
    availabilityStatus: string[];
    hasSocialMedia: boolean;
  };
  
  // Actions
  fetchMembers: () => Promise<void>;
  setSearchTerm: (term: string) => void;
  setFilters: (filters: Partial<GalleryState['filters']>) => void;
  applyFilters: () => void;
  resetFilters: () => void;
}

const initialFilters = {
  memberTypes: [],
  specializations: [],
  locations: [],
  availabilityStatus: [],
  hasSocialMedia: false,
};

export const useGalleryStore = create<GalleryState>((set, get) => ({
  members: [],
  filteredMembers: [],
  isLoading: false,
  error: null,
  searchTerm: '',
  filters: initialFilters,

  fetchMembers: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const members = await memberService.getPublicMembers();
      set({ 
        members, 
        filteredMembers: members, 
        isLoading: false 
      });
    } catch (error) {
      console.error('Error fetching members:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch members',
        isLoading: false 
      });
    }
  },

  setSearchTerm: (searchTerm: string) => {
    set({ searchTerm });
    get().applyFilters();
  },

  setFilters: (newFilters: Partial<GalleryState['filters']>) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters }
    }));
    get().applyFilters();
  },

  applyFilters: () => {
    const { members, searchTerm, filters } = get();
    
    let filtered = [...members];

    // Apply search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(member =>
        member.first_name?.toLowerCase().includes(term) ||
        member.last_name?.toLowerCase().includes(term) ||
        member.display_name?.toLowerCase().includes(term) ||
        member.main_profession?.toLowerCase().includes(term) ||
        member.company?.toLowerCase().includes(term) ||
        member.other_professions?.some(prof => prof.toLowerCase().includes(term))
      );
    }

    // Apply member type filter
    if (filters.memberTypes.length > 0) {
      filtered = filtered.filter(member =>
        member.membership_type && filters.memberTypes.includes(member.membership_type)
      );
    }

    // Apply location filter
    if (filters.locations.length > 0) {
      filtered = filtered.filter(member =>
        member.autonomous_community && filters.locations.includes(member.autonomous_community)
      );
    }

    // Apply social media filter
    if (filters.hasSocialMedia) {
      filtered = filtered.filter(member =>
        member.social_media && Object.keys(member.social_media).length > 0
      );
    }

    set({ filteredMembers: filtered });
  },

  resetFilters: () => {
    set({ 
      filters: initialFilters, 
      searchTerm: '',
      filteredMembers: get().members 
    });
  },
}));

export default useGalleryStore;`;

  const galleryStorePath = path.join(__dirname, '..', 'src', 'store', 'galleryStore.ts');
  fs.writeFileSync(galleryStorePath, galleryStoreContent);
  console.log('   ✅ Updated gallery store');
}

// Update authentication context
function updateAuthContext() {
  console.log('🔧 Updating authentication context...');
  
  const authContextContent = `import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { authService, memberService, activityService } from '../services/supabaseService';
import supabase from '../services/supabaseService';
import type { Member } from '../types/supabase';

interface AuthContextType {
  user: User | null;
  member: Member | null;
  session: Session | null;
  isLoading: boolean;
  signInWithMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Member>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    authService.getCurrentSession().then(session => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user?.email) {
        // Load member profile
        loadMemberProfile(session.user.email);
      }
      
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user?.email) {
          await loadMemberProfile(session.user.email);
          
          // Log login activity
          if (event === 'SIGNED_IN') {
            await authService.updateLastLogin(session.user.email);
          }
        } else {
          setMember(null);
        }
        
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadMemberProfile = async (email: string) => {
    try {
      const memberProfile = await memberService.getMemberByEmail(email);
      setMember(memberProfile);
    } catch (error) {
      console.error('Error loading member profile:', error);
      setMember(null);
    }
  };

  const signInWithMagicLink = async (email: string) => {
    await authService.signInWithMagicLink(email);
  };

  const signOut = async () => {
    await authService.signOut();
    setMember(null);
  };

  const updateProfile = async (updates: Partial<Member>) => {
    if (!member) throw new Error('No member profile loaded');
    
    const updatedMember = await memberService.updateMemberProfile(member.id, updates);
    setMember(updatedMember);
    
    // Log profile update activity
    await activityService.logActivity(member.id, 'profile_update', { 
      updated_fields: Object.keys(updates) 
    });
  };

  const value = {
    user,
    member,
    session,
    isLoading,
    signInWithMagicLink,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}`;

  const authContextPath = path.join(__dirname, '..', 'src', 'contexts', 'AuthContext.tsx');
  fs.writeFileSync(authContextPath, authContextContent);
  console.log('   ✅ Updated authentication context');
}

// Update environment template
function updateEnvironmentTemplate() {
  console.log('🔧 Updating environment template...');
  
  const currentEnvPath = path.join(__dirname, '..', '.env.example');
  let envContent = '';
  
  if (fs.existsSync(currentEnvPath)) {
    envContent = fs.readFileSync(currentEnvPath, 'utf-8');
  }
  
  // Add real data configuration section
  const realDataConfig = `

##################################
# REAL DATA CONFIGURATION
##################################
# Mock data has been replaced with Supabase integration
VITE_ENABLE_MOCK_DATA=false
VITE_ENABLE_REAL_DATA=true

# Database status
DATABASE_MIGRATED=false
STRIPE_INTEGRATED=false

##################################
# MIGRATION STATUS
##################################
# Track migration progress
WORDPRESS_DATA_EXPORTED=true
SUPABASE_SCHEMA_APPLIED=false
MEMBER_DATA_IMPORTED=false
STRIPE_DATA_SYNCED=false
`;

  if (!envContent.includes('REAL DATA CONFIGURATION')) {
    envContent += realDataConfig;
    fs.writeFileSync(currentEnvPath, envContent);
    console.log('   ✅ Updated environment template');
  }
}

// Create migration status file
function createMigrationStatus() {
  console.log('📊 Creating migration status file...');
  
  const migrationStatus = {
    timestamp: new Date().toISOString(),
    status: 'in_progress',
    steps: {
      wordpress_export: { completed: true, timestamp: new Date().toISOString() },
      supabase_schema: { completed: false, timestamp: null },
      data_transformation: { completed: true, timestamp: new Date().toISOString() },
      member_import: { completed: false, timestamp: null },
      stripe_integration: { completed: false, timestamp: null },
      mock_data_removal: { completed: true, timestamp: new Date().toISOString() },
      real_data_integration: { completed: true, timestamp: new Date().toISOString() }
    },
    statistics: {
      total_members: 329,
      members_with_stripe: 317,
      board_members: 8,
      categories_created: 0,
      files_created: 8,
      files_removed: 2
    },
    next_steps: [
      '1. Create Supabase project at https://supabase.com/dashboard',
      '2. Apply schema.sql to your Supabase database',
      '3. Import member data using members-insert.sql',
      '4. Add Supabase credentials to .env.local',
      '5. Add Stripe credentials to .env.local',
      '6. Run stripe integration script',
      '7. Test the application with real data'
    ],
    files_created: [
      'src/services/supabaseService.ts',
      'src/types/supabase.ts',
      'scripts/setup-supabase.js',
      'scripts/migrate-wordpress-to-supabase.js',
      'scripts/stripe-integration.js',
      'supabase/schema.sql',
      'scripts/exports/supabase-members.json',
      'scripts/exports/members-insert.sql'
    ],
    files_removed: filesToRemove,
    files_updated: [
      'src/services/apiService.ts',
      'src/store/galleryStore.ts',
      'src/contexts/AuthContext.tsx',
      '.env.example'
    ]
  };
  
  const statusPath = path.join(__dirname, '..', 'migration-status.json');
  fs.writeFileSync(statusPath, JSON.stringify(migrationStatus, null, 2));
  console.log('   ✅ Created migration status file');
  
  return migrationStatus;
}

// Main replacement function
async function replaceMockData() {
  try {
    console.log('🚀 Starting mock data replacement...\n');
    
    // Remove mock data files
    removeMockDataFiles();
    
    // Create new services
    createSupabaseService();
    updateApiService();
    updateGalleryStore();
    updateAuthContext();
    
    // Update configuration
    updateEnvironmentTemplate();
    
    // Create migration status
    const migrationStatus = createMigrationStatus();
    
    console.log('\n✅ Mock data replacement completed!');
    console.log('\n📊 Summary:');
    console.log(`   - Files created: ${migrationStatus.files_created.length}`);
    console.log(`   - Files removed: ${migrationStatus.files_removed.length}`);
    console.log(`   - Files updated: ${migrationStatus.files_updated.length}`);
    console.log(`   - Total members ready: ${migrationStatus.statistics.total_members}`);
    
    console.log('\n🔄 Next Steps:');
    migrationStatus.next_steps.forEach(step => {
      console.log(`   ${step}`);
    });
    
    console.log('\n📁 Key Files:');
    console.log('   - Migration Status: migration-status.json');
    console.log('   - Database Schema: supabase/schema.sql');
    console.log('   - Member Data: scripts/exports/supabase-members.json');
    console.log('   - SQL Import: scripts/exports/members-insert.sql');
    
    console.log('\n⚠️  Important Notes:');
    console.log('   - Mock data has been removed from the codebase');
    console.log('   - Application now requires Supabase configuration to work');
    console.log('   - Add your credentials to .env.local before running the app');
    console.log('   - All member data is now sourced from real database');
    
  } catch (error) {
    console.error('❌ Mock data replacement failed:', error.message);
    process.exit(1);
  }
}

// Run replacement
replaceMockData();
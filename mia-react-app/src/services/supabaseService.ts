import { createClient } from '@supabase/supabase-js';
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
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,main_profession.ilike.%${query}%,company.ilike.%${query}%`)
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
        emailRedirectTo: `${window.location.origin}/portal`
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

export default supabase;
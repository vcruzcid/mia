import { supabase } from '../supabase.client';
import type { Member, PublicMember, ActiveMember } from '../../types/supabase';
import type { MemberFilters } from './member.types';

// Helper function to check if member is active
export const isActiveMember = (member: Partial<Member>): boolean => {
  return member.stripe_subscription_status === 'active';
};

// Helper function to format member display name
export const getMemberDisplayName = (member: Partial<Member>): string => {
  if (member.display_name) return member.display_name;
  return `${member.first_name || ''} ${member.last_name || ''}`.trim();
};

// Get all public members (active members with public privacy)
export async function getPublicMembers(): Promise<PublicMember[]> {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('stripe_subscription_status', 'active')
      .eq('privacy_level', 'public')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching public members:', error);
    return [];
  }
}

// Get all active members
export async function getActiveMembers(): Promise<ActiveMember[]> {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('stripe_subscription_status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching active members:', error);
    return [];
  }
}

// Get all members (admin function)
export async function getAllMembers(): Promise<Member[]> {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching all members:', error);
    return [];
  }
}

// Get member by ID
export async function getMemberById(id: string): Promise<Member | null> {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching member by ID:', error);
    return null;
  }
}

// Get member by email
export async function getMemberByEmail(email: string): Promise<Member | null> {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('email', email)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching member by email:', error);
    return null;
  }
}

// Get member by Stripe customer ID
export async function getMemberByStripeId(stripeCustomerId: string): Promise<Member | null> {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('stripe_customer_id', stripeCustomerId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching member by Stripe ID:', error);
    return null;
  }
}

// Search members
export async function searchMembers(query: string, activeOnly: boolean = true): Promise<Member[]> {
  try {
    let supabaseQuery = supabase.from('members').select('*');

    if (activeOnly) {
      supabaseQuery = supabaseQuery.eq('stripe_subscription_status', 'active');
    }

    const { data, error } = await supabaseQuery
      .or(
        `first_name.ilike.%${query}%,last_name.ilike.%${query}%,display_name.ilike.%${query}%,main_profession.ilike.%${query}%,company.ilike.%${query}%,email.ilike.%${query}%`
      )
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching members:', error);
    return [];
  }
}

// Filter members with advanced options
export async function filterMembers(filters: MemberFilters): Promise<Member[]> {
  try {
    let query = supabase.from('members').select('*');

    // Filter by active status
    if (filters.activeOnly !== false) {
      query = query.eq('stripe_subscription_status', 'active');
    }

    // Filter by membership types
    if (filters.membershipTypes?.length) {
      query = query.in('membership_type', filters.membershipTypes);
    }

    // Filter by locations (autonomous communities)
    if (filters.locations?.length) {
      query = query.in('autonomous_community', filters.locations);
    }

    // Filter by professions
    if (filters.professions?.length) {
      query = query.in('main_profession', filters.professions);
    }

    // Filter by years of experience
    if (filters.yearsExperience?.min !== undefined) {
      query = query.gte('years_experience', filters.yearsExperience.min);
    }
    if (filters.yearsExperience?.max !== undefined) {
      query = query.lte('years_experience', filters.yearsExperience.max);
    }

    // Apply pagination
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;
    
    const { data, error } = await query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error filtering members:', error);
    return [];
  }
}

// Update member profile
export async function updateMemberProfile(id: string, updates: Partial<Member>): Promise<Member | null> {
  try {
    const { data, error } = await supabase
      .from('members')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating member profile:', error);
    return null;
  }
}

// Update member subscription status from Stripe
export async function updateMemberSubscriptionStatus(
  stripeCustomerId: string, 
  subscriptionData: {
    status: string;
    subscription_id?: string;
    current_period_end?: string;
    cancel_at_period_end?: boolean;
  }
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('members')
      .update({
        stripe_subscription_status: subscriptionData.status,
        stripe_subscription_id: subscriptionData.subscription_id,
        subscription_current_period_end: subscriptionData.current_period_end,
        cancel_at_period_end: subscriptionData.cancel_at_period_end,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_customer_id', stripeCustomerId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating member subscription status:', error);
    return false;
  }
}


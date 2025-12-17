import { supabase } from '../supabase.client';
import type { Member, PublicMember, ActiveMember } from '../../types/supabase';
import type { MemberFilters } from './member.types';

export interface DirectoryQueryParams {
  searchTerm?: string;
  membershipTypes?: string[];
  specializations?: string[];
  locations?: string[];
  availabilityStatus?: string[];
  limit?: number;
  offset?: number;
  includePrivate?: boolean; // members_only vs public_members
  isFounder?: boolean; // for fundadoras gallery
}

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
      .from('public_members')
      .select('*')
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
      .from('active_members')
      .select('*')
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
    const normalized = email.trim().toLowerCase();

    // 1) Find member_id by email in the private table
    const { data: privateRow, error: privateError } = await supabase
      .from('member_private')
      .select('member_id')
      .ilike('email', normalized)
      .maybeSingle();

    if (privateError) throw privateError;
    if (!privateRow?.member_id) return null;

    // 2) Prefer the members-only directory view (includes membership + profile + private)
    const { data: directoryRow, error: directoryError } = await supabase
      .from('members_only')
      .select('*')
      .eq('id', privateRow.member_id)
      .maybeSingle();

    // If the member isn't active yet, the view may filter them out; fall back to raw tables
    if (!directoryError && directoryRow) return directoryRow as unknown as Member;

    const [mRes, pRes, mmRes, privRes] = await Promise.all([
      supabase.from('members').select('*').eq('id', privateRow.member_id).maybeSingle(),
      supabase.from('member_profile').select('*').eq('member_id', privateRow.member_id).maybeSingle(),
      supabase.from('member_membership').select('*').eq('member_id', privateRow.member_id).maybeSingle(),
      supabase.from('member_private').select('*').eq('member_id', privateRow.member_id).maybeSingle(),
    ]);

    if (mRes.error) throw mRes.error;
    if (pRes.error) throw pRes.error;
    if (mmRes.error) throw mmRes.error;
    if (privRes.error) throw privRes.error;

    if (!mRes.data) return null;

    // Merge into the legacy Member shape used across the app (best-effort)
    return {
      ...(mRes.data as any),
      ...(pRes.data as any),
      ...(mmRes.data as any),
      ...(privRes.data as any),
      id: (mRes.data as any).id,
      email: (privRes.data as any)?.email ?? normalized,
      stripe_customer_id: (mmRes.data as any)?.stripe_customer_id,
      stripe_subscription_id: (mmRes.data as any)?.stripe_subscription_id,
      stripe_subscription_status: (mmRes.data as any)?.stripe_subscription_status,
      subscription_current_period_end: (mmRes.data as any)?.subscription_current_period_end,
    } as Member;
  } catch (error) {
    console.error('Error fetching member by email:', error);
    return null;
  }
}

// Server-side directory query (public_members or members_only view)
export async function getDirectoryMembers(params: DirectoryQueryParams): Promise<{ members: Member[]; total: number }> {
  const {
    searchTerm,
    membershipTypes,
    specializations,
    locations,
    availabilityStatus,
    limit = 20,
    offset = 0,
    includePrivate = false,
    isFounder,
  } = params;

  const source = includePrivate ? 'members_only' : 'public_members';

  // NOTE: We don't use select('*') on base tables; we query via views.
  let query = supabase
    .from(source)
    .select('*', { count: 'exact' });

  if (searchTerm && searchTerm.trim().length > 0) {
    const q = searchTerm.trim();
    query = query.or(
      `first_name.ilike.%${q}%,last_name.ilike.%${q}%,display_name.ilike.%${q}%,main_profession.ilike.%${q}%,company.ilike.%${q}%`
    );
  }

  if (membershipTypes && membershipTypes.length > 0) {
    query = query.in('membership_type', membershipTypes);
  }

  if (locations && locations.length > 0) {
    query = query.in('autonomous_community', locations);
  }

  if (availabilityStatus && availabilityStatus.length > 0) {
    query = query.in('availability_status', availabilityStatus);
  }

  if (typeof isFounder === 'boolean') {
    query = query.eq('is_founder', isFounder);
  }

  // Arrays: match any specialization via overlap
  if (specializations && specializations.length > 0) {
    // @ts-expect-error supabase-js supports overlaps for PostgREST arrays
    query = query.overlaps('other_professions', specializations);
  }

  // Default ordering: photo first, then completion, then newest
  query = query
    .order('profile_image_url', { ascending: true, nullsFirst: false })
    .order('profile_completion', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  return { members: (data || []) as unknown as Member[], total: count || 0 };
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


import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required Supabase environment variables. Please check your configuration.');
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

  // Filter members with improved performance
  async filterMembers(filters: {
    memberTypes?: string[];
    locations?: string[];
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

    const limit = filters.limit || 50;
    const offset = filters.offset || 0;
    
    query = query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

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
  },

  // Get member with Stripe data
  async getMemberWithStripe(email: string) {
    const { data, error } = await supabase
      .from('member_stripe_data')
      .select('*')
      .eq('email', email)
      .single();

    if (error) throw error;
    return data;
  },

  // Get member subscription status
  async getMemberSubscriptionStatus(email?: string) {
    if (!email) {
      const user = await supabase.auth.getUser();
      if (!user.data.user?.email) throw new Error('No authenticated user');
      email = user.data.user.email;
    }

    const { data, error } = await supabase
      .rpc('get_member_subscription_status', { member_email: email });

    if (error) throw error;
    return data?.[0];
  },

  // Link member to Stripe customer
  async linkMemberToStripeCustomer(email: string, stripeCustomerId: string) {
    const { error } = await supabase
      .rpc('link_member_to_stripe_customer', { 
        member_email: email, 
        stripe_customer_id: stripeCustomerId 
      });

    if (error) throw error;
  }
};

// Authentication functions
export const authService = {
  // Sign in with magic link (only for existing members)
  async signInWithMagicLink(email: string) {
    // First check if the email belongs to an existing member
    const member = await memberService.getMemberByEmail(email);
    
    if (!member) {
      throw new Error('Email address not found. You must be a member to access the portal. Please subscribe at /membership to become a member first.');
    }

    // Check if member account is active
    if (!member.is_active) {
      throw new Error('Your membership account is inactive. Please contact support for assistance.');
    }

    // Only send magic link if user is an existing active member
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/portal`,
        shouldCreateUser: false // Prevent creating new users
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

// File upload service
export const fileService = {
  // Upload member file (profile image or CV)
  async uploadMemberFile(file: File, type: 'profile' | 'cv', memberId?: string): Promise<string> {
    if (!memberId) {
      const user = await supabase.auth.getUser();
      if (!user.data.user?.id) throw new Error('No authenticated user');
      
      // Get member ID from user email
      const member = await memberService.getMemberByEmail(user.data.user.email!);
      if (!member) throw new Error('Member not found');
      memberId = member.id;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${memberId}-${type}-${Date.now()}.${fileExt}`;
    const filePath = `member-assets/${type}s/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('member-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('member-files')
      .getPublicUrl(filePath);

    return publicUrl;
  },

  // Delete member file
  async deleteMemberFile(filePath: string) {
    const { error } = await supabase.storage
      .from('member-files')
      .remove([filePath]);

    if (error) throw error;
  },

  // Get file download URL
  async getFileDownloadUrl(filePath: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from('member-files')
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (error) throw error;
    return data.signedUrl;
  }
};

// Stripe-related functions using Foreign Data Wrapper
export const stripeService = {
  // Create Stripe Customer Portal session
  async createStripePortalSession(customerId?: string): Promise<{ url: string }> {
    if (!customerId) {
      const user = await supabase.auth.getUser();
      if (!user.data.user?.email) throw new Error('No authenticated user');
      
      const member = await memberService.getMemberWithStripe(user.data.user.email);
      if (!member?.stripe_customer_id) throw new Error('No Stripe customer found');
      customerId = member.stripe_customer_id;
    }

    // Call Edge Function to create portal session
    const { data, error } = await supabase.functions.invoke('create-stripe-portal', {
      body: { customerId }
    });

    if (error) throw error;
    return data;
  },

  // Get Stripe customer by ID
  async getStripeCustomer(customerId: string) {
    const { data, error } = await supabase
      .from('stripe.customers')
      .select('*')
      .eq('id', customerId)
      .single();

    if (error) throw error;
    return data;
  },

  // Get Stripe subscriptions for a customer
  async getCustomerSubscriptions(customerId: string) {
    const { data, error } = await supabase
      .from('stripe.subscriptions')
      .select('*')
      .eq('customer', customerId)
      .order('created', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get all Stripe products
  async getStripeProducts() {
    const { data, error } = await supabase
      .from('stripe.products')
      .select('*')
      .eq('active', true)
      .order('created', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get prices for a product
  async getProductPrices(productId: string) {
    const { data, error } = await supabase
      .from('stripe.prices')
      .select('*')
      .eq('product', productId)
      .eq('active', true);

    if (error) throw error;
    return data;
  },

  // Get subscription by ID
  async getStripeSubscription(subscriptionId: string) {
    const { data, error } = await supabase
      .from('stripe.subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .single();

    if (error) throw error;
    return data;
  },

  // Create checkout session
  async createCheckoutSession(priceId: string, memberEmail?: string): Promise<{ sessionId: string }> {
    if (!memberEmail) {
      const user = await supabase.auth.getUser();
      if (!user.data.user?.email) throw new Error('No authenticated user');
      memberEmail = user.data.user.email;
    }

    const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
      body: { priceId, memberEmail }
    });

    if (error) throw error;
    return data;
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

// Main service object that combines all services
export const supabaseService = {
  // Re-export individual services
  member: memberService,
  auth: authService,
  file: fileService,
  stripe: stripeService,
  activity: activityService,

  // Direct exports for backward compatibility
  getPublicMembers: memberService.getPublicMembers,
  getMemberById: memberService.getMemberById,
  searchMembers: memberService.searchMembers,
  filterMembers: memberService.filterMembers,
  getBoardMembers: memberService.getBoardMembers,
  getMemberByEmail: memberService.getMemberByEmail,
  updateMemberProfile: memberService.updateMemberProfile,
  getMemberWithStripe: memberService.getMemberWithStripe,
  getMemberSubscriptionStatus: memberService.getMemberSubscriptionStatus,
  linkMemberToStripeCustomer: memberService.linkMemberToStripeCustomer,

  signInWithMagicLink: authService.signInWithMagicLink,
  signOut: authService.signOut,
  getCurrentSession: authService.getCurrentSession,
  getCurrentUser: authService.getCurrentUser,
  updateLastLogin: authService.updateLastLogin,

  uploadMemberFile: fileService.uploadMemberFile,
  deleteMemberFile: fileService.deleteMemberFile,
  getFileDownloadUrl: fileService.getFileDownloadUrl,

  createStripePortalSession: stripeService.createStripePortalSession,
  getStripeCustomer: stripeService.getStripeCustomer,
  getCustomerSubscriptions: stripeService.getCustomerSubscriptions,
  getStripeProducts: stripeService.getStripeProducts,
  getProductPrices: stripeService.getProductPrices,
  getStripeSubscription: stripeService.getStripeSubscription,
  createCheckoutSession: stripeService.createCheckoutSession,

  logActivity: activityService.logActivity
};

export default supabase;
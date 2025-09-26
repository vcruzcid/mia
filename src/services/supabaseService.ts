import { createClient } from '@supabase/supabase-js';
import type { Database, Member, PublicMember, ActiveMember, CurrentBoardMember, MemberStats } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Missing');
console.log('Supabase Key:', supabaseAnonKey ? 'Set' : 'Missing');

// Testing mode flag - can be toggled for development
const TESTING_MODE = import.meta.env.NODE_ENV === 'development';

// Create a safe Supabase client with error handling
let supabase: any = null;

try {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables:', {
      url: supabaseUrl,
      key: supabaseAnonKey ? 'Present' : 'Missing'
    });
    throw new Error('Missing required Supabase environment variables. Please check your configuration.');
  }

  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
  console.log('Supabase client created successfully');
} catch (error) {
  console.error('Error creating Supabase client:', error);
  // Create a mock client to prevent app crashes
  supabase = {
    from: () => ({
      select: () => ({ data: [], error: { message: 'Supabase client not initialized' } }),
      insert: () => ({ data: null, error: { message: 'Supabase client not initialized' } }),
      update: () => ({ data: null, error: { message: 'Supabase client not initialized' } }),
      delete: () => ({ data: null, error: { message: 'Supabase client not initialized' } })
    }),
    rpc: () => Promise.resolve({ data: null, error: { message: 'Supabase client not initialized' } }),
    auth: {
      signInWithOtp: () => Promise.resolve({ data: null, error: { message: 'Supabase client not initialized' } }),
      signOut: () => Promise.resolve({ error: { message: 'Supabase client not initialized' } }),
      getUser: () => Promise.resolve({ data: { user: null }, error: { message: 'Supabase client not initialized' } }),
      getSession: () => Promise.resolve({ data: { session: null }, error: { message: 'Supabase client not initialized' } })
    }
  };
}

export { supabase };

// Helper function to check if member is active
export const isActiveMember = (member: Partial<Member>): boolean => {
  return member.stripe_subscription_status === 'active';
};

// Helper function to check if member should be shown in testing mode
export const isTestingMember = (member: Partial<Member>): boolean => {
  if (isActiveMember(member)) return true; // Always include active members
  
  // Include members with real Stripe customer IDs
  if (member.stripe_customer_id && !member.stripe_customer_id.startsWith('placeholder_')) {
    return true;
  }
  
  // Include members with profile images
  if (member.profile_image_url && member.profile_image_url.trim() !== '') {
    return true;
  }
  
  return false;
};

// Helper function to format member display name
export const getMemberDisplayName = (member: Partial<Member>): string => {
  if (member.display_name) return member.display_name;
  return `${member.first_name || ''} ${member.last_name || ''}`.trim();
};

// Member-related functions
export const memberService = {
  // Get all public members (active members with public privacy)
  async getPublicMembers(): Promise<PublicMember[]> {
    try {
      // Try public_members view first
      const { data, error } = await supabase
        .from('public_members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('public_members view not available, falling back to manual filtering:', error.message);
        
        if (TESTING_MODE) {
          console.log('🧪 TESTING MODE: Using expanded member criteria');
          return this.getTestingPublicMembers();
        } else {
          // Production: Get active members with public privacy manually
          return this.getActiveMembersFiltered({ privacy_level: 'public' });
        }
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching public members:', error);
      
      if (TESTING_MODE) {
        return this.getTestingPublicMembers();
      }
      
      return [];
    }
  },

  // TESTING MODE: Get members for development/testing (more inclusive than production)
  async getTestingPublicMembers(): Promise<Member[]> {
    try {
      console.log('🧪 TESTING MODE: Loading expanded member list for development');
      
      const { data: allMembers, error } = await supabase
        .from('members')
        .select('*')
        .eq('privacy_level', 'public') // Still respect privacy
        .order('created_at', { ascending: false })
        .limit(200); // Higher limit for testing

      if (error) {
        console.error('Testing mode query failed:', error);
        return [];
      }

      // Filter using our testing criteria
      const testingMembers = allMembers.filter(member => {
        // Skip admin users
        if (member.email?.includes('admin')) return false;
        
        return isTestingMember(member);
      });

      console.log(`🧪 Testing mode: ${allMembers.length} total public members, ${testingMembers.length} match testing criteria`);
      console.log('Testing criteria: active subscription OR real Stripe customer OR has profile image');
      
      return testingMembers;
    } catch (error) {
      console.error('Error in testing members:', error);
      return [];
    }
  },

  // Get all active members (those with active Stripe subscriptions)
  async getActiveMembers(): Promise<ActiveMember[]> {
    try {
      const { data, error } = await supabase
        .from('active_members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('active_members view not available, falling back to filtered members:', error.message);
        return this.getActiveMembersFiltered();
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching active members:', error);
      return [];
    }
  },

  // Get current board members (with active terms)
  async getBoardMembers(): Promise<CurrentBoardMember[]> {
    try {
      const { data, error } = await supabase
        .from('board_members')
        .select('*')
        .order('board_term_start', { ascending: false });

      if (error) {
        console.warn('board_members view not available, falling back to filtered members:', error.message);
        // Fallback: Get members with is_board_member = true, exclude admin
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('members')
          .select('*')
          .eq('is_board_member', true)
          .not('email', 'like', '%admin%') // Exclude admin users
          .order('created_at', { ascending: false });

        if (fallbackError) throw fallbackError;
        console.log(`📋 Board members fallback: found ${fallbackData?.length || 0} board members`);
        return fallbackData || [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching board members:', error);
      return [];
    }
  },

  // Get member statistics
  async getMemberStats(): Promise<MemberStats> {
    try {
      const { data, error } = await supabase
        .from('member_stats')
        .select('*')
        .single();

      if (error) {
        console.warn('member_stats view not available, calculating manually:', error.message);
        // Fallback: Calculate stats manually
        const members = await this.getAllMembers();
        
        let activeCount = 0;
        let professionalCount = 0;
        let studentCount = 0;
        let collaboratorCount = 0;
        
        if (TESTING_MODE) {
          activeCount = members.filter(m => isTestingMember(m)).length;
          professionalCount = members.filter(m => m.membership_type === 'profesional' && isTestingMember(m)).length;
          studentCount = members.filter(m => m.membership_type === 'estudiante' && isTestingMember(m)).length;
          collaboratorCount = members.filter(m => m.membership_type === 'colaborador' && isTestingMember(m)).length;
        } else {
          activeCount = members.filter(m => isActiveMember(m)).length;
          professionalCount = members.filter(m => m.membership_type === 'profesional' && isActiveMember(m)).length;
          studentCount = members.filter(m => m.membership_type === 'estudiante' && isActiveMember(m)).length;
          collaboratorCount = members.filter(m => m.membership_type === 'colaborador' && isActiveMember(m)).length;
        }
        
        const stats: MemberStats = {
          total_members: members.length,
          active_members: activeCount,
          board_members: members.filter(m => m.is_board_member && !m.email?.includes('admin')).length,
          professional_members: professionalCount,
          student_members: studentCount,
          collaborator_members: collaboratorCount,
        };
        
        console.log(`📊 Manual stats calculation (${TESTING_MODE ? 'testing' : 'production'} mode):`, stats);
        return stats;
      }

      return data;
    } catch (error) {
      console.error('Error fetching member stats:', error);
      return {
        total_members: 0,
        active_members: 0,
        board_members: 0,
        professional_members: 0,
        student_members: 0,
        collaborator_members: 0,
      };
    }
  },

  // Get all members (admin function)
  async getAllMembers(): Promise<Member[]> {
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
  },

  // Helper function for active members with filters
  async getActiveMembersFiltered(filters: Partial<Member> = {}): Promise<Member[]> {
    try {
      let query = supabase.from('members').select('*');
      
      if (TESTING_MODE) {
        console.log('🧪 TESTING MODE: Using expanded active member criteria');
        // In testing mode, include members with stripe customer IDs or images
        // This query will be more complex, so let's get all and filter in JS
        const { data: allMembers, error } = await supabase
          .from('members')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        const testingMembers = allMembers.filter(member => {
          // Apply additional filters first
          for (const [key, value] of Object.entries(filters)) {
            if (value !== undefined && member[key] !== value) {
              return false;
            }
          }
          
          // Skip admin users
          if (member.email?.includes('admin')) return false;
          
          return isTestingMember(member);
        });
        
        console.log(`🧪 Filtered testing members: ${testingMembers.length} match criteria`);
        return testingMembers;
      } else {
        // Production mode: only active subscriptions
        query = query.eq('stripe_subscription_status', 'active');

        // Apply additional filters
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            query = query.eq(key, value);
          }
        });

        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
      }
    } catch (error) {
      console.error('Error fetching filtered active members:', error);
      return [];
    }
  },

  // Get member by ID
  async getMemberById(id: string): Promise<Member | null> {
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
  },

  // Get member by email (using database function)
  async getMemberByEmail(email: string): Promise<Member | null> {
    try {
      const { data, error } = await supabase
        .rpc('sync_member_stripe_status', { member_email: email });

      if (error) {
        console.warn('Database function not available, falling back to direct query:', error.message);
        // Fallback to direct query
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('members')
          .select('*')
          .eq('email', email)
          .single();

        if (fallbackError) throw fallbackError;
        return fallbackData;
      }

      // Get the updated member data after sync
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .select('*')
        .eq('email', email)
        .single();

      if (memberError) throw memberError;
      return memberData;
    } catch (error) {
      console.error('Error fetching member by email:', error);
      return null;
    }
  },

  // Search members with improved filtering
  async searchMembers(query: string, activeOnly: boolean = true): Promise<Member[]> {
    try {
      let supabaseQuery = supabase.from('members').select('*');

      // Apply active filter based on mode
      if (activeOnly) {
        if (TESTING_MODE) {
          // In testing mode, get all and filter in JS for more complex logic
          const { data: allMembers, error } = await supabaseQuery
            .or(
              `first_name.ilike.%${query}%,last_name.ilike.%${query}%,display_name.ilike.%${query}%,main_profession.ilike.%${query}%,company.ilike.%${query}%,email.ilike.%${query}%`
            )
            .order('created_at', { ascending: false })
            .limit(100);

          if (error) throw error;
          
          return allMembers.filter(member => {
            if (member.email?.includes('admin')) return false;
            return isTestingMember(member);
          });
        } else {
          supabaseQuery = supabaseQuery.eq('stripe_subscription_status', 'active');
        }
      }

      // Search across multiple fields
      supabaseQuery = supabaseQuery.or(
        `first_name.ilike.%${query}%,last_name.ilike.%${query}%,display_name.ilike.%${query}%,main_profession.ilike.%${query}%,company.ilike.%${query}%,email.ilike.%${query}%`
      );

      const { data, error } = await supabaseQuery
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching members:', error);
      return [];
    }
  },

  // Filter members with advanced options
  async filterMembers(filters: {
    membershipTypes?: string[];
    locations?: string[];
    professions?: string[];
    yearsExperience?: { min?: number; max?: number };
    activeOnly?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Member[]> {
    try {
      let query = supabase.from('members').select('*');

      // Filter by active status based on mode
      if (filters.activeOnly !== false) {
        if (TESTING_MODE) {
          // In testing mode, we'll filter in JavaScript after getting results
          console.log('🧪 TESTING MODE: Will apply active filter using testing criteria');
        } else {
          query = query.eq('stripe_subscription_status', 'active');
        }
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
      
      let results = data || [];
      
      // Apply testing mode filter if needed
      if (TESTING_MODE && filters.activeOnly !== false) {
        results = results.filter(member => {
          if (member.email?.includes('admin')) return false;
          return isTestingMember(member);
        });
        console.log(`🧪 TESTING MODE: Filtered to ${results.length} members using testing criteria`);
      }
      
      return results;
    } catch (error) {
      console.error('Error filtering members:', error);
      return [];
    }
  },

  // Update member profile
  async updateMemberProfile(id: string, updates: Partial<Member>): Promise<Member | null> {
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
  },

  // Sync member with Stripe data
  async syncMemberStripeStatus(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('sync_member_stripe_status', { member_email: email });

      if (error) {
        console.warn('Stripe sync function not available:', error.message);
        return false;
      }

      return data?.success || false;
    } catch (error) {
      console.error('Error syncing member Stripe status:', error);
      return false;
    }
  },

  // Sync all members with Stripe
  async syncAllMembersWithStripe(): Promise<{ success: boolean; stats?: any }> {
    try {
      const { data, error } = await supabase
        .rpc('sync_all_members_with_stripe');

      if (error) {
        console.warn('Batch sync function not available:', error.message);
        return { success: false };
      }

      return { success: data?.success || false, stats: data };
    } catch (error) {
      console.error('Error syncing all members:', error);
      return { success: false };
    }
  },

  // Create or update member
  async upsertMember(memberData: {
    email: string;
    first_name?: string;
    last_name?: string;
    stripe_customer_id?: string;
    phone?: string;
    additional_data?: Record<string, any>;
  }): Promise<{ success: boolean; member_id?: string }> {
    try {
      const { data, error } = await supabase
        .rpc('upsert_member', {
          p_email: memberData.email,
          p_first_name: memberData.first_name,
          p_last_name: memberData.last_name,
          p_stripe_customer_id: memberData.stripe_customer_id,
          p_phone: memberData.phone,
          p_additional_data: memberData.additional_data
        });

      if (error) {
        console.warn('Upsert function not available, using direct insert/update:', error.message);
        // Fallback to direct operations
        const existing = await this.getMemberByEmail(memberData.email);
        
        if (existing) {
          const updated = await this.updateMemberProfile(existing.id, memberData);
          return { success: !!updated, member_id: updated?.id };
        } else {
          // Direct insert
          const { data: newMember, error: insertError } = await supabase
            .from('members')
            .insert({
              email: memberData.email,
              first_name: memberData.first_name || 'Unknown',
              last_name: memberData.last_name || 'User',
              stripe_customer_id: memberData.stripe_customer_id || `placeholder_${Date.now()}`,
              address: 'Pending Address',
              city: 'Pending City',
              country: 'Spain',
              membership_type: 'profesional'
            })
            .select()
            .single();

          if (insertError) throw insertError;
          return { success: true, member_id: newMember.id };
        }
      }

      return { success: data?.success || false, member_id: data?.member_id };
    } catch (error) {
      console.error('Error upserting member:', error);
      return { success: false };
    }
  }
};

// Board member management functions
export const boardService = {
  // Assign board position
  async assignBoardPosition(
    memberEmail: string,
    position: 'Presidenta' | 'Secretaria' | 'Tesorera' | 'Vocal',
    termStart: string,
    termEnd: string
  ): Promise<{ success: boolean; board_id?: string }> {
    try {
      const { data, error } = await supabase
        .rpc('manage_board_member', {
          p_member_email: memberEmail,
          p_position: position,
          p_term_start: termStart,
          p_term_end: termEnd,
          p_action: 'assign'
        });

      if (error) {
        console.warn('Board management function not available:', error.message);
        return { success: false };
      }

      return { success: data?.success || false, board_id: data?.board_id };
    } catch (error) {
      console.error('Error assigning board position:', error);
      return { success: false };
    }
  },

  // Remove board position
  async removeBoardPosition(
    memberEmail: string,
    position: string,
    termStart: string,
    termEnd: string
  ): Promise<{ success: boolean }> {
    try {
      const { data, error } = await supabase
        .rpc('manage_board_member', {
          p_member_email: memberEmail,
          p_position: position,
          p_term_start: termStart,
          p_term_end: termEnd,
          p_action: 'remove'
        });

      if (error) {
        console.warn('Board management function not available:', error.message);
        return { success: false };
      }

      return { success: data?.success || false };
    } catch (error) {
      console.error('Error removing board position:', error);
      return { success: false };
    }
  }
};

// Authentication functions with Stripe-centric approach
export const authService = {
  // Sign in with magic link (only for existing active members)
  async signInWithMagicLink(email: string): Promise<void> {
    // First verify the email belongs to an existing member
    const member = await memberService.getMemberByEmail(email);
    
    if (!member) {
      throw new Error('Email address not found. You must be a member to access the portal. Please subscribe to become a member first.');
    }

    // Check if member has active subscription (using appropriate logic based on mode)
    const hasAccess = TESTING_MODE ? isTestingMember(member) : isActiveMember(member);
    
    if (!hasAccess) {
      const modeMsg = TESTING_MODE ? 
        'Your account does not meet testing criteria (active subscription, Stripe customer, or profile image).' :
        'Your membership subscription is not active. Please renew your subscription to access the portal.';
      throw new Error(modeMsg);
    }

    // Send magic link only to verified active members
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/portal`,
        shouldCreateUser: false // Prevent creating new auth users
      }
    });

    if (error) throw error;
  },

  // Sign out
  async signOut(): Promise<void> {
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

  // Get current member (combines auth user with member data)
  async getCurrentMember(): Promise<Member | null> {
    const user = await this.getCurrentUser();
    if (!user?.email) return null;

    return await memberService.getMemberByEmail(user.email);
  },

  // Update last login timestamp
  async updateLastLogin(email: string): Promise<void> {
    try {
      // Try using database function first
      const { error } = await supabase
        .rpc('update_member_last_login', { member_email: email });

      if (error) {
        console.warn('Last login function not available, using direct update:', error.message);
        // Fallback to direct update
        await supabase
          .from('members')
          .update({ 
            last_login: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('email', email);
      }
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  }
};

// File upload service for member assets
export const fileService = {
  // Upload member file (profile image or CV)
  async uploadMemberFile(file: File, type: 'profile' | 'cv', memberId?: string): Promise<string> {
    if (!memberId) {
      const member = await authService.getCurrentMember();
      if (!member) throw new Error('No authenticated member');
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
  async deleteMemberFile(filePath: string): Promise<void> {
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

// Stripe integration service (using Foreign Data Wrapper and Edge Functions)
export const stripeService = {
  // Get Stripe customer data for member
  async getStripeCustomerForMember(email: string) {
    try {
      const { data, error } = await supabase
        .from('stripeschema.customers')
        .select('*')
        .eq('email', email)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching Stripe customer:', error);
      return null;
    }
  },

  // Get member's subscription data
  async getMemberSubscriptions(stripeCustomerId: string) {
    try {
      const { data, error } = await supabase
        .from('stripeschema.subscriptions')
        .select('*')
        .eq('customer', stripeCustomerId)
        .order('created', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching member subscriptions:', error);
      return [];
    }
  },

  // Create Stripe Customer Portal session
  async createPortalSession(customerId?: string): Promise<{ url: string }> {
    if (!customerId) {
      const member = await authService.getCurrentMember();
      if (!member?.stripe_customer_id) throw new Error('No Stripe customer found');
      customerId = member.stripe_customer_id;
    }

    const { data, error } = await supabase.functions.invoke('create-stripe-portal', {
      body: { customerId }
    });

    if (error) throw error;
    return data;
  },

  // Handle Stripe webhook (called from Edge Function)
  async handleWebhook(eventType: string, customerId: string, subscriptionData?: Record<string, any>) {
    try {
      const { data, error } = await supabase
        .rpc('handle_stripe_webhook', {
          event_type: eventType,
          customer_id: customerId,
          subscription_data: subscriptionData
        });

      if (error) {
        console.warn('Webhook handler function not available:', error.message);
        return { success: false };
      }

      return { success: data?.success || false, result: data };
    } catch (error) {
      console.error('Error handling Stripe webhook:', error);
      return { success: false };
    }
  }
};

// Main service object that combines all services
export const supabaseService = {
  // Service modules
  member: memberService,
  board: boardService,
  auth: authService,
  file: fileService,
  stripe: stripeService,

  // Helper functions
  isActiveMember,
  isTestingMember,
  getMemberDisplayName,

  // Testing mode flag
  TESTING_MODE,

  // Direct exports for backward compatibility
  getPublicMembers: memberService.getPublicMembers,
  getActiveMembers: memberService.getActiveMembers,
  getBoardMembers: memberService.getBoardMembers,
  getMemberStats: memberService.getMemberStats,
  getAllMembers: memberService.getAllMembers,
  getMemberById: memberService.getMemberById,
  getMemberByEmail: memberService.getMemberByEmail,
  searchMembers: memberService.searchMembers,
  filterMembers: memberService.filterMembers,
  updateMemberProfile: memberService.updateMemberProfile,
  syncMemberStripeStatus: memberService.syncMemberStripeStatus,
  syncAllMembersWithStripe: memberService.syncAllMembersWithStripe,
  upsertMember: memberService.upsertMember,

  signInWithMagicLink: authService.signInWithMagicLink,
  signOut: authService.signOut,
  getCurrentSession: authService.getCurrentSession,
  getCurrentUser: authService.getCurrentUser,
  getCurrentMember: authService.getCurrentMember,
  updateLastLogin: authService.updateLastLogin,

  uploadMemberFile: fileService.uploadMemberFile,
  deleteMemberFile: fileService.deleteMemberFile,
  getFileDownloadUrl: fileService.getFileDownloadUrl,

  assignBoardPosition: boardService.assignBoardPosition,
  removeBoardPosition: boardService.removeBoardPosition,

  getStripeCustomerForMember: stripeService.getStripeCustomerForMember,
  getMemberSubscriptions: stripeService.getMemberSubscriptions,
  createPortalSession: stripeService.createPortalSession,
  handleWebhook: stripeService.handleWebhook
};

export default supabase;
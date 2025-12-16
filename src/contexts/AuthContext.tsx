import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../services';
import * as authService from '../services/auth/auth.service';
import * as memberService from '../services/members/member.service';
import { verifyAndUpdateMemberSubscription } from '../services/stripe/stripe.sync';
import { isActiveMember, getMemberDisplayName } from '../services/members/member.service';
import type { Member } from '../types/supabase';

export interface MembershipStatus {
  isActive: boolean;
  subscriptionStatus?: string;
  subscriptionEnd?: string;
  membershipType: string;
}

interface AuthContextType {
  user: User | null;
  member: Member | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  membershipStatus: MembershipStatus | null;
  signInWithMagicLink: (email: string) => Promise<void>;
  sendMagicLink: (email: string) => Promise<{ success: boolean; message: string }>;
  verifyMagicLink: (tokenHash: string) => Promise<{ success: boolean; message: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Member>) => Promise<void>;
  refreshMemberData: () => Promise<void>;
  syncStripeStatus: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [membershipStatus, setMembershipStatus] = useState<MembershipStatus | null>(null);

  useEffect(() => {
    // Get initial session and member data
    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: Session | null) => {
        // Auth state changed
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user?.email) {
          await loadMemberProfile(session.user.email);
          
          // Update last login timestamp on sign in
          if (event === 'SIGNED_IN') {
            await authService.updateLastLogin(session.user.email);
            // Updated last login
          }
        } else {
          // Clear member data on sign out
          setMember(null);
          setMembershipStatus(null);
        }
        
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Initialize authentication state
  const initializeAuth = async () => {
    try {
      const session = await authService.getCurrentSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user?.email) {
        await loadMemberProfile(session.user.email);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load member profile with Stripe verification
  const loadMemberProfile = async (email: string) => {
    try {
      // 1. Get member data from database
      const memberProfile = await memberService.getMemberByEmail(email);
      
      if (memberProfile) {
        // 2. CRITICAL: Verify subscription status with Stripe API
        if (memberProfile.stripe_customer_id) {
          console.log('Verifying subscription status with Stripe for:', email);
          await verifyAndUpdateMemberSubscription(memberProfile.stripe_customer_id);
          
          // Reload member data after verification to get updated status
          const updatedMember = await memberService.getMemberByEmail(email);
          if (updatedMember) {
            setMember(updatedMember);
            
            // Calculate membership status with verified data
            const status: MembershipStatus = {
              isActive: isActiveMember(updatedMember),
              subscriptionStatus: updatedMember.stripe_subscription_status,
              subscriptionEnd: updatedMember.subscription_current_period_end,
              membershipType: updatedMember.membership_type
            };
            
            setMembershipStatus(status);
            console.log('Member profile loaded with verified subscription:', status);
          }
        } else {
          // No Stripe customer ID, use DB data as-is
          setMember(memberProfile);
          
          const status: MembershipStatus = {
            isActive: false, // No Stripe ID means no active subscription
            subscriptionStatus: memberProfile.stripe_subscription_status,
            subscriptionEnd: memberProfile.subscription_current_period_end,
            membershipType: memberProfile.membership_type
          };
          
          setMembershipStatus(status);
        }
      } else {
        console.warn('No member profile found for email:', email);
        setMember(null);
        setMembershipStatus(null);
      }
    } catch (error) {
      console.error('Error loading member profile:', error);
      setMember(null);
      setMembershipStatus(null);
    }
  };

  // Send magic link for authentication
  const sendMagicLink = async (email: string) => {
    try {
      await authService.signInWithMagicLink(email);
      return { 
        success: true, 
        message: 'Magic link sent! Please check your email and click the link to sign in.' 
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send magic link';
      console.error('Magic link error:', errorMessage);
      
      return { 
        success: false, 
        message: errorMessage
      };
    }
  };

  // Sign in with magic link (wrapper for consistency)
  const signInWithMagicLink = async (email: string) => {
    const result = await sendMagicLink(email);
    if (!result.success) {
      throw new Error(result.message);
    }
  };

  // Verify magic link token using PKCE flow
  const verifyMagicLink = async (tokenHash: string) => {
    try {
      // Verifying magic link
      
      // Use verifyOtp for PKCE flow with token_hash
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: 'email'
      });
      
      if (error) {
        console.error('Magic link verification error:', error);
        return { 
          success: false, 
          message: error.message || 'Failed to verify magic link. Please try again.' 
        };
      }
      
      if (data?.session) {
        // Magic link verified successfully
        return { 
          success: true, 
          message: 'Magic link verified successfully!' 
        };
      } else {
        return { 
          success: false, 
          message: 'Magic link verification failed. Please request a new one.' 
        };
      }
    } catch (error) {
      console.error('Magic link verification error:', error);
      return { 
        success: false, 
        message: 'Failed to verify magic link. Please try again.' 
      };
    }
  };

  // Sign out user
  const signOut = async () => {
    try {
      // Signing out user
      await authService.signOut();
      
      // Clear local state
      setMember(null);
      setMembershipStatus(null);
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  // Update member profile
  const updateProfile = async (updates: Partial<Member>) => {
    if (!member) {
      throw new Error('No member profile available to update');
    }
    
    try {
      // Updating member profile
      
      const updatedMember = await memberService.updateMemberProfile(member.id, updates);
      
      if (updatedMember) {
        setMember(updatedMember);
        
        // Recalculate membership status if subscription-related fields changed
        if ('stripe_subscription_status' in updates || 'subscription_current_period_end' in updates) {
          const status: MembershipStatus = {
            isActive: isActiveMember(updatedMember),
            subscriptionStatus: updatedMember.stripe_subscription_status,
            subscriptionEnd: updatedMember.subscription_current_period_end,
            membershipType: updatedMember.membership_type
          };
          setMembershipStatus(status);
        }
        
        // Profile updated successfully
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  // Refresh member data from database
  const refreshMemberData = async () => {
    if (!user?.email) {
      console.warn('Cannot refresh member data: no authenticated user');
      return;
    }
    
    // Refreshing member data
    await loadMemberProfile(user.email);
  };

  // Sync member status with Stripe
  const syncStripeStatus = async (): Promise<boolean> => {
    if (!user?.email || !member?.stripe_customer_id) {
      console.warn('Cannot sync Stripe status: no authenticated user or Stripe customer ID');
      return false;
    }
    
    try {
      // Verify and update subscription status with Stripe
      const hadDiscrepancy = await verifyAndUpdateMemberSubscription(member.stripe_customer_id);
      
      // Refresh member data after sync
      await refreshMemberData();
      
      if (hadDiscrepancy) {
        console.log('Stripe sync completed - discrepancy was fixed');
      }
      
      return true;
    } catch (error) {
      console.error('Error syncing Stripe status:', error);
      return false;
    }
  };

  // Context value
  const value = {
    user,
    member,
    session,
    isLoading,
    isAuthenticated: !!user && !!member && isActiveMember(member),
    membershipStatus,
    signInWithMagicLink,
    sendMagicLink,
    verifyMagicLink,
    signOut,
    updateProfile,
    refreshMemberData,
    syncStripeStatus,
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
}

// Helper hook for member data
export function useMember() {
  const { member, membershipStatus, isAuthenticated } = useAuth();
  
  return {
    member,
    membershipStatus,
    isAuthenticated,
    isActive: membershipStatus?.isActive || false,
    displayName: member ? getMemberDisplayName(member) : null,
    isBoardMember: member?.is_board_member || false,
    membershipType: member?.membership_type || null,
    subscriptionStatus: membershipStatus?.subscriptionStatus || null
  };
}

// Helper hook for authentication actions
export function useAuthActions() {
  const { 
    signInWithMagicLink, 
    sendMagicLink, 
    signOut, 
    updateProfile, 
    refreshMemberData, 
    syncStripeStatus 
  } = useAuth();
  
  return {
    signInWithMagicLink,
    sendMagicLink,
    signOut,
    updateProfile,
    refreshMemberData,
    syncStripeStatus
  };
}
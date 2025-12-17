import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../services';
import * as authService from '../services/auth/auth.service';
import * as memberService from '../services/members/member.service';
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
  isAdmin: boolean;
  membershipStatus: MembershipStatus | null;
  sendMagicLink: (email: string) => Promise<{ success: boolean; message: string }>;
  verifyMagicLink: (tokenHash: string) => Promise<{ success: boolean; message: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Member>) => Promise<void>;
  refreshMemberData: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [membershipStatus, setMembershipStatus] = useState<MembershipStatus | null>(null);

  useEffect(() => {
    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session: Session | null) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user?.email) {
          await loadMemberProfile(session.user.email);
          
          if (event === 'SIGNED_IN') {
            await authService.updateLastLogin(session.user.email);
          }
        } else {
          setMember(null);
          setMembershipStatus(null);
        }
        
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

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

  const loadMemberProfile = async (email: string) => {
    try {
      const memberProfile = await memberService.getMemberByEmail(email);
      
      if (memberProfile) {
        setMember(memberProfile);
        
        const status: MembershipStatus = {
          isActive: isActiveMember(memberProfile),
          subscriptionStatus: memberProfile.stripe_subscription_status,
          subscriptionEnd: memberProfile.subscription_current_period_end,
          membershipType: memberProfile.membership_type
        };
        
        setMembershipStatus(status);
      } else {
        setMember(null);
        setMembershipStatus(null);
      }
    } catch (error) {
      console.error('Error loading member profile:', error);
      setMember(null);
      setMembershipStatus(null);
    }
  };

  const sendMagicLink = async (email: string) => {
    try {
      await authService.sendMagicLink(email);
      return { 
        success: true, 
        message: '¡Enlace mágico enviado! Revisa tu correo electrónico y haz clic en el enlace para acceder.' 
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al enviar enlace mágico';
      return { 
        success: false, 
        message: errorMessage
      };
    }
  };

  const verifyMagicLink = async (tokenHash: string) => {
    try {
      await authService.verifyMagicLink(tokenHash);
      return { 
        success: true, 
        message: 'Enlace verificado correctamente' 
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al verificar enlace mágico';
      return { 
        success: false, 
        message: errorMessage
      };
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      setMember(null);
      setMembershipStatus(null);
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Error during sign out:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<Member>) => {
    if (!member) {
      throw new Error('No hay perfil de socia disponible para actualizar');
    }
    
    try {
      const updatedMember = await memberService.updateMemberProfile(member.id, updates);
      
      if (updatedMember) {
        setMember(updatedMember);
        
        if ('stripe_subscription_status' in updates || 'subscription_current_period_end' in updates) {
          const status: MembershipStatus = {
            isActive: isActiveMember(updatedMember),
            subscriptionStatus: updatedMember.stripe_subscription_status,
            subscriptionEnd: updatedMember.subscription_current_period_end,
            membershipType: updatedMember.membership_type
          };
          setMembershipStatus(status);
        }
      } else {
        throw new Error('Error al actualizar perfil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const refreshMemberData = async () => {
    if (!user?.email) return;
    await loadMemberProfile(user.email);
  };

  const isAuthenticated = !!user && !!member && isActiveMember(member);
  const isAdmin = member?.is_board_member || false; // For now, board members are considered admins

  const value = {
    user,
    member,
    session,
    isLoading,
    isAuthenticated,
    isAdmin,
    membershipStatus,
    sendMagicLink,
    verifyMagicLink,
    signOut,
    updateProfile,
    refreshMemberData,
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
    sendMagicLink, 
    signOut, 
    updateProfile, 
    refreshMemberData
  } = useAuth();
  
  return {
    sendMagicLink,
    signOut,
    updateProfile,
    refreshMemberData
  };
}
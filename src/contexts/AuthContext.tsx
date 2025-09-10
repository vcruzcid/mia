import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { authService, memberService, activityService } from '../services/supabaseService';
import supabase from '../services/supabaseService';
import type { Member } from '../types/supabase';

interface AuthContextType {
  user: User | null;
  member: Member | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signInWithMagicLink: (email: string) => Promise<void>;
  sendMagicLink: (email: string) => Promise<{ success: boolean; message: string }>;
  verifyMagicLink: (token: string) => Promise<{ success: boolean; message: string }>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Member>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

  const sendMagicLink = async (email: string) => {
    try {
      await authService.signInWithMagicLink(email);
      return { success: true, message: 'Magic link sent successfully' };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to send magic link' 
      };
    }
  };

  const verifyMagicLink = async (_token: string) => {
    try {
      // This would be handled automatically by Supabase auth state change
      return { success: true, message: 'Successfully authenticated' };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Authentication failed' 
      };
    }
  };

  const signOut = async () => {
    await authService.signOut();
    setMember(null);
  };

  const logout = async () => {
    await signOut();
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
    isAuthenticated: !!user,
    signInWithMagicLink,
    sendMagicLink,
    verifyMagicLink,
    signOut,
    logout,
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
}
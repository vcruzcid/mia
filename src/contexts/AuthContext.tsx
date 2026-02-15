import React, { createContext, useContext } from 'react';

// Stubbed authentication context - all authentication is non-functional
// This file is kept to prevent import errors throughout the codebase

export interface MembershipStatus {
  isActive: boolean;
  subscriptionStatus?: string;
  subscriptionEnd?: string;
  membershipType: string;
}

interface AuthContextType {
  user: null;
  member: null;
  session: null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  membershipStatus: MembershipStatus | null;
  sendMagicLink: (email: string) => Promise<{ success: boolean; message: string }>;
  verifyMagicLink: (tokenHash: string) => Promise<{ success: boolean; message: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: any) => Promise<void>;
  refreshMemberData: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Stubbed provider - returns mock authentication state (always not authenticated)
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const value: AuthContextType = {
    user: null,
    member: null,
    session: null,
    isLoading: false,
    isAuthenticated: false,
    isAdmin: false,
    membershipStatus: null,
    sendMagicLink: async () => ({ success: false, message: 'Authentication is not available' }),
    verifyMagicLink: async () => ({ success: false, message: 'Authentication is not available' }),
    signOut: async () => {},
    updateProfile: async () => {},
    refreshMemberData: async () => {},
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

// Helper hook for member data (stubbed)
export function useMember() {
  return {
    member: null,
    membershipStatus: null,
    isAuthenticated: false,
    isActive: false,
    displayName: null,
    isBoardMember: false,
    membershipType: null,
    subscriptionStatus: null
  };
}

// Helper hook for authentication actions (stubbed)
export function useAuthActions() {
  return {
    sendMagicLink: async () => ({ success: false, message: 'Authentication is not available' }),
    signOut: async () => {},
    updateProfile: async () => {},
    refreshMemberData: async () => {}
  };
}

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService, type Member, type AuthState } from '../services/authService';

interface AuthContextType extends AuthState {
  sendMagicLink: (email: string) => Promise<{ success: boolean; message: string }>;
  verifyMagicLink: (token: string) => Promise<{ success: boolean; message: string }>;
  updateProfile: (updates: Partial<Member>) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  refreshMember: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    member: null,
    token: null,
    isLoading: true,
  });

  const setLoading = (isLoading: boolean) => {
    setAuthState(prev => ({ ...prev, isLoading }));
  };

  const setAuthenticated = (member: Member, token: string) => {
    setAuthState({
      isAuthenticated: true,
      member,
      token,
      isLoading: false,
    });
  };

  const clearAuth = () => {
    setAuthState({
      isAuthenticated: false,
      member: null,
      token: null,
      isLoading: false,
    });
  };

  const sendMagicLink = async (email: string) => {
    setLoading(true);
    const result = await authService.sendMagicLink(email);
    setLoading(false);
    return result;
  };

  const verifyMagicLink = async (token: string) => {
    setLoading(true);
    const result = await authService.verifyMagicLink(token);
    
    if (result.success && result.member && result.authToken) {
      setAuthenticated(result.member, result.authToken);
    } else {
      setLoading(false);
    }
    
    return { success: result.success, message: result.message };
  };

  const updateProfile = async (updates: Partial<Member>) => {
    const result = await authService.updateMemberProfile(updates);
    
    if (result.success && result.member) {
      setAuthState(prev => ({
        ...prev,
        member: result.member!,
      }));
    }
    
    return { success: result.success, message: result.message };
  };

  const logout = async () => {
    setLoading(true);
    await authService.logout();
    clearAuth();
  };

  const refreshMember = async () => {
    if (!authState.isAuthenticated) return;
    
    const result = await authService.getCurrentMember();
    if (result.success && result.member) {
      setAuthState(prev => ({
        ...prev,
        member: result.member!,
      }));
    } else if (!result.success && result.message === 'Authentication expired') {
      clearAuth();
    }
  };

  // Initialize auth state on app start
  useEffect(() => {
    const initAuth = async () => {
      const token = authService.getAuthToken();
      if (token) {
        const result = await authService.getCurrentMember();
        if (result.success && result.member) {
          setAuthenticated(result.member, token);
        } else {
          authService.clearAuth();
          clearAuth();
        }
      } else {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const contextValue: AuthContextType = {
    ...authState,
    sendMagicLink,
    verifyMagicLink,
    updateProfile,
    logout,
    refreshMember,
  };

  return (
    <AuthContext.Provider value={contextValue}>
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
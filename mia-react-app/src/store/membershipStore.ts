import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { MembershipType } from '../types';

interface MembershipState {
  selectedMembership: MembershipType | null;
  isLoading: boolean;
  error: string | null;
  setSelectedMembership: (membership: MembershipType | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useMembershipStore = create<MembershipState>()(
  devtools(
    (set) => ({
      selectedMembership: null,
      isLoading: false,
      error: null,
      setSelectedMembership: (membership) => 
        set({ selectedMembership: membership }, false, 'setSelectedMembership'),
      setLoading: (loading) => 
        set({ isLoading: loading }, false, 'setLoading'),
      setError: (error) => 
        set({ error }, false, 'setError'),
      clearError: () => 
        set({ error: null }, false, 'clearError'),
    }),
    {
      name: 'membership-store',
    }
  )
);
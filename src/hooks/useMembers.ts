import { useQuery } from '@tanstack/react-query';
import { getPublicMembers, searchMembers, filterMembers } from '../services/members/member.service';
import type { Member } from '../types/supabase';
import type { MemberFilters } from '../services/members/member.types';

/**
 * Hook to fetch and manage public members
 */
export function usePublicMembers() {
  return useQuery({
    queryKey: ['members', 'public'],
    queryFn: getPublicMembers,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to search members
 */
export function useSearchMembers(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['members', 'search', query],
    queryFn: () => searchMembers(query, true),
    enabled: enabled && query.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to filter members with advanced options
 */
export function useFilteredMembers(filters: MemberFilters) {
  return useQuery({
    queryKey: ['members', 'filtered', filters],
    queryFn: () => filterMembers(filters),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Helper functions for member filtering and display
 */

export function getAvailableLocations(members: Member[]): string[] {
  const locations = new Set<string>();
  members.forEach(member => {
    if (member.autonomous_community) {
      locations.add(member.autonomous_community);
    }
  });
  return Array.from(locations).sort();
}

export function getMemberCounts(members: Member[]) {
  // NOTE:
  // `usePublicMembers()` reads from the `public_members` view. Depending on how the
  // view is defined, it may not expose `stripe_subscription_status` (or it may come
  // through as `undefined`). In that case, all returned rows are *already active*,
  // so we treat the active count as the total length to avoid showing 0 everywhere.
  const hasAnySubscriptionStatus = members.some(
    (m) => typeof m.stripe_subscription_status === 'string' && m.stripe_subscription_status.length > 0
  );

  const counts = {
    total: members.length,
    active: hasAnySubscriptionStatus
      ? members.filter((m) => m.stripe_subscription_status === 'active').length
      : members.length,
    byType: {} as Record<string, number>,
    byAvailability: {} as Record<string, number>,
  };

  members.forEach(member => {
    // Count by membership type
    const type = member.membership_type || 'unknown';
    counts.byType[type] = (counts.byType[type] || 0) + 1;

    // Count by availability status
    const availability = member.availability_status || 'unknown';
    counts.byAvailability[availability] = (counts.byAvailability[availability] || 0) + 1;
  });

  return counts;
}

/**
 * Client-side filtering for complex queries
 */
export function applyClientFilters(
  members: Member[],
  filters: {
    specializations?: string[];
    locations?: string[];
    availabilityStatus?: string[];
    hasSocialMedia?: boolean | null;
  },
  searchTerm?: string
): Member[] {
  let filtered = [...members];

  // Search filter
  if (searchTerm && searchTerm.length > 0) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(member =>
      member.first_name?.toLowerCase().includes(term) ||
      member.last_name?.toLowerCase().includes(term) ||
      member.display_name?.toLowerCase().includes(term) ||
      member.main_profession?.toLowerCase().includes(term) ||
      member.company?.toLowerCase().includes(term)
    );
  }

  // Specializations filter
  if (filters.specializations && filters.specializations.length > 0) {
    filtered = filtered.filter(member =>
      filters.specializations!.some(spec =>
        member.other_professions?.includes(spec) ||
        member.main_profession === spec
      )
    );
  }

  // Locations filter
  if (filters.locations && filters.locations.length > 0) {
    filtered = filtered.filter(member =>
      filters.locations!.includes(member.autonomous_community || '')
    );
  }

  // Availability status filter
  if (filters.availabilityStatus && filters.availabilityStatus.length > 0) {
    filtered = filtered.filter(member =>
      filters.availabilityStatus!.includes(member.availability_status || '')
    );
  }

  // Social media filter
  if (filters.hasSocialMedia !== null) {
    filtered = filtered.filter(member => {
      const hasSocial = member.social_media && 
        Object.values(member.social_media).some(value => value && value.length > 0);
      return filters.hasSocialMedia ? hasSocial : !hasSocial;
    });
  }

  return filtered;
}


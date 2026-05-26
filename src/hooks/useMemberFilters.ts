import { useMemo, useState } from 'react';
import type { Member } from '@/types/member';

export type MemberFilters = {
  specializations: string[];
  locations: string[];
  availabilityStatus: string[];
  hasSocialMedia: boolean | null;
  membershipTypes: string[];
};

const DEFAULT_FILTERS: MemberFilters = {
  specializations: [],
  locations: [],
  availabilityStatus: [],
  hasSocialMedia: null,
  membershipTypes: [],
};

export function useMemberFilters(members: Member[], searchTerm: string) {
  const [filters, setFiltersState] = useState<MemberFilters>(DEFAULT_FILTERS);

  const availableLocations = useMemo(() => {
    const locs = new Set<string>();
    members.forEach(m => {
      if (m.city) locs.add(m.city);
      if (m.country) locs.add(m.country);
    });
    return Array.from(locs).sort();
  }, [members]);

  const memberCounts = useMemo(() => {
    const byType: Record<string, number> = {};
    const byAvailability: Record<string, number> = {};
    members.forEach(m => {
      if (m.membership_type) {
        byType[m.membership_type] = (byType[m.membership_type] ?? 0) + 1;
      }
      const status = m.availability_status ?? 'Disponible';
      byAvailability[status] = (byAvailability[status] ?? 0) + 1;
    });
    return { byType, byAvailability };
  }, [members]);

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const nameMatch = `${m.first_name} ${m.last_name}`.toLowerCase().includes(q);
        const profMatch = (m.main_profession ?? '').toLowerCase().includes(q);
        if (!nameMatch && !profMatch) return false;
      }
      if (filters.specializations.length > 0) {
        const allProfs = [m.main_profession, ...(m.other_professions ?? [])].filter(Boolean) as string[];
        if (!filters.specializations.some(s => allProfs.includes(s))) return false;
      }
      if (filters.locations.length > 0) {
        const memberLocs = [m.city, m.country].filter(Boolean) as string[];
        if (!filters.locations.some(l => memberLocs.includes(l))) return false;
      }
      if (filters.availabilityStatus.length > 0) {
        if (!filters.availabilityStatus.includes(m.availability_status ?? '')) return false;
      }
      if (filters.membershipTypes.length > 0) {
        if (!filters.membershipTypes.includes(m.membership_type ?? '')) return false;
      }
      if (filters.hasSocialMedia !== null) {
        const hasSocial = Object.values(m.social_media ?? {}).some(Boolean);
        if (filters.hasSocialMedia !== hasSocial) return false;
      }
      return true;
    });
  }, [members, filters, searchTerm]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    count += filters.specializations.length;
    count += filters.locations.length;
    count += filters.availabilityStatus.length;
    count += filters.membershipTypes.length;
    if (filters.hasSocialMedia !== null) count++;
    return count;
  }, [filters]);

  function setFilters(updates: Partial<MemberFilters>) {
    setFiltersState(prev => ({ ...prev, ...updates }));
  }

  function resetFilters() {
    setFiltersState(DEFAULT_FILTERS);
  }

  function toggle(
    key: keyof Pick<MemberFilters, 'specializations' | 'locations' | 'availabilityStatus' | 'membershipTypes'>,
    value: string,
  ) {
    setFiltersState(prev => {
      const arr = prev[key];
      const next = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
      return { ...prev, [key]: next };
    });
  }

  return {
    filters,
    setFilters,
    resetFilters,
    filteredMembers,
    activeFilterCount,
    availableLocations,
    memberCounts,
    toggleSpecialization: (s: string) => toggle('specializations', s),
    toggleLocation: (l: string) => toggle('locations', l),
    toggleAvailabilityStatus: (s: string) => toggle('availabilityStatus', s),
    toggleMembershipType: (t: string) => toggle('membershipTypes', t),
  };
}

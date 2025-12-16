import { useState, useCallback, useMemo } from 'react';

export interface MemberFilters {
  specializations: string[];
  locations: string[];
  availabilityStatus: string[];
  hasSocialMedia: boolean | null;
}

const initialFilters: MemberFilters = {
  specializations: [],
  locations: [],
  availabilityStatus: [],
  hasSocialMedia: null,
};

/**
 * Custom hook to manage member filtering state
 * Replaces the Zustand store filter logic
 */
export function useMemberFilters() {
  const [filters, setFilters] = useState<MemberFilters>(initialFilters);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleSpecialization = useCallback((spec: string) => {
    setFilters(prev => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter(s => s !== spec)
        : [...prev.specializations, spec]
    }));
  }, []);

  const toggleLocation = useCallback((location: string) => {
    setFilters(prev => ({
      ...prev,
      locations: prev.locations.includes(location)
        ? prev.locations.filter(l => l !== location)
        : [...prev.locations, location]
    }));
  }, []);

  const toggleAvailabilityStatus = useCallback((status: string) => {
    setFilters(prev => ({
      ...prev,
      availabilityStatus: prev.availabilityStatus.includes(status)
        ? prev.availabilityStatus.filter(s => s !== status)
        : [...prev.availabilityStatus, status]
    }));
  }, []);

  const updateFilters = useCallback((updates: Partial<MemberFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    setSearchTerm('');
  }, []);

  const getActiveFiltersCount = useCallback(() => {
    return (
      filters.specializations.length +
      filters.locations.length +
      filters.availabilityStatus.length +
      (filters.hasSocialMedia !== null ? 1 : 0)
    );
  }, [filters]);

  const hasActiveFilters = useMemo(() => {
    return getActiveFiltersCount() > 0 || searchTerm.length > 0;
  }, [getActiveFiltersCount, searchTerm]);

  return {
    filters,
    searchTerm,
    setSearchTerm,
    setFilters: updateFilters,
    toggleSpecialization,
    toggleLocation,
    toggleAvailabilityStatus,
    resetFilters,
    getActiveFiltersCount,
    hasActiveFilters,
  };
}


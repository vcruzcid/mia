// Utility functions for member data
import type { Member } from '../types/member';

/**
 * Get available locations from member list
 */
export function getAvailableLocations(members: Member[]): string[] {
  const locations = new Set<string>();

  members.forEach(member => {
    if (member.city) locations.add(member.city);
    if (member.province) locations.add(member.province);
    if (member.autonomous_community) locations.add(member.autonomous_community);
  });

  return Array.from(locations).sort();
}

/**
 * Get member counts by type and availability
 */
export function getMemberCounts(members: Member[]) {
  // Count by membership type
  const byType: Record<string, number> = {};
  members.forEach(member => {
    const type = member.membership_type || 'unknown';
    byType[type] = (byType[type] || 0) + 1;
  });

  // Count by availability status
  const byAvailability: Record<string, number> = {};
  members.forEach(member => {
    const status = member.availability_status || 'No especificado';
    byAvailability[status] = (byAvailability[status] || 0) + 1;
  });

  return {
    total: members.length,
    active: members.length, // In static mode, all listed members are considered active
    professional: members.filter(m => m.membership_type === 'pleno_derecho' || m.membership_type === 'profesional').length,
    student: members.filter(m => m.membership_type === 'estudiante').length,
    collaborator: members.filter(m => m.membership_type === 'colaborador').length,
    byType,
    byAvailability,
  };
}

/**
 * Filter members by search term and filters
 */
export function filterMembers(
  members: Member[],
  searchTerm: string,
  filters?: {
    membershipTypes?: string[];
    specializations?: string[];
    locations?: string[];
    availabilityStatus?: string[];
  }
): Member[] {
  let filtered = [...members];

  // Search term filter
  if (searchTerm) {
    const search = searchTerm.toLowerCase();
    filtered = filtered.filter(member => {
      return (
        member.first_name?.toLowerCase().includes(search) ||
        member.last_name?.toLowerCase().includes(search) ||
        member.display_name?.toLowerCase().includes(search) ||
        member.company?.toLowerCase().includes(search) ||
        member.main_profession?.toLowerCase().includes(search) ||
        member.other_professions?.some(p => p.toLowerCase().includes(search)) ||
        member.city?.toLowerCase().includes(search) ||
        member.province?.toLowerCase().includes(search) ||
        member.autonomous_community?.toLowerCase().includes(search)
      );
    });
  }

  // Membership type filter
  if (filters?.membershipTypes && filters.membershipTypes.length > 0) {
    filtered = filtered.filter(member =>
      filters.membershipTypes!.includes(member.membership_type)
    );
  }

  // Specialization filter
  if (filters?.specializations && filters.specializations.length > 0) {
    filtered = filtered.filter(member => {
      const professions = [
        member.main_profession,
        ...(member.other_professions || [])
      ].filter(Boolean);

      return filters.specializations!.some(spec =>
        professions.some(prof => prof?.toLowerCase().includes(spec.toLowerCase()))
      );
    });
  }

  // Location filter
  if (filters?.locations && filters.locations.length > 0) {
    filtered = filtered.filter(member => {
      const locations = [
        member.city,
        member.province,
        member.autonomous_community
      ].filter(Boolean);

      return filters.locations!.some(loc =>
        locations.some(l => l?.toLowerCase().includes(loc.toLowerCase()))
      );
    });
  }

  // Availability status filter
  if (filters?.availabilityStatus && filters.availabilityStatus.length > 0) {
    filtered = filtered.filter(member =>
      filters.availabilityStatus!.includes(member.availability_status || '')
    );
  }

  return filtered;
}

import { create } from 'zustand';
import { memberService, isActiveMember } from '../services/supabaseService';
import type { Member } from '../types/supabase';
import { cleanMemberData } from '../utils/textDecoding';

interface GalleryState {
  members: Member[];
  filteredMembers: Member[];
  isLoading: boolean;
  loading: boolean; // Alias for isLoading
  error: string | null;
  searchTerm: string;
  selectedMember: Member | null;
  isModalOpen: boolean;
  selectedYear: number;
  availableYears: number[];
  filters: {
    memberTypes: string[];
    specializations: string[];
    locations: string[];
    availabilityStatus: string[];
    hasSocialMedia: boolean | null;
    isActive: boolean | null;
  };
  
  // Actions
  fetchMembers: () => Promise<void>;
  fetchDirectiva: () => Promise<void>;
  setSearchTerm: (term: string) => void;
  setFilters: (filters: Partial<GalleryState['filters']>) => void;
  setSelectedYear: (year: number) => void;
  applyFilters: () => void;
  resetFilters: () => void;
  
  // Member actions
  openMemberModal: (member: Member) => void;
  closeMemberModal: () => void;
  
  // Filter toggles
  toggleMemberType: (type: string) => void;
  toggleSpecialization: (spec: string) => void;
  toggleLocation: (location: string) => void;
  toggleAvailabilityStatus: (status: string) => void;
  
  // Getters
  getFilteredMembers: () => Member[];
  getFilteredDirectiva: () => any[];
  getAvailableLocations: () => string[];
  getMemberCounts: () => { 
    total: number; 
    active: number; 
    byType: Record<string, number>;
    byAvailability: Record<string, number>;
  };
}

const initialFilters = {
  memberTypes: [],
  specializations: [],
  locations: [],
  availabilityStatus: [],
  hasSocialMedia: null,
  isActive: null,
};

export const useGalleryStore = create<GalleryState>((set, get) => ({
  members: [],
  filteredMembers: [],
  isLoading: false,
  loading: false,
  error: null,
  searchTerm: '',
  selectedMember: null,
  isModalOpen: false,
  selectedYear: new Date().getFullYear(),
  availableYears: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
  filters: initialFilters,

  fetchMembers: async () => {
    set({ isLoading: true, loading: true, error: null });
    
    try {
      const rawMembers = await memberService.getPublicMembers();
      
      // Clean any encoded characters from WordPress imports
      const members = rawMembers.map(member => cleanMemberData(member));
      
      set({ 
        members, 
        filteredMembers: members, 
        isLoading: false,
        loading: false 
      });
      
      // Members loaded successfully
    } catch (error) {
      console.error('Error fetching members:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch members',
        isLoading: false,
        loading: false 
      });
    }
  },

  fetchDirectiva: async () => {
    set({ isLoading: true, loading: true, error: null });
    
    try {
      const rawMembers = await memberService.getBoardMembers();
      
      // Clean any encoded characters from WordPress imports
      const members = rawMembers.map(member => cleanMemberData(member));
      
      set({ 
        members, 
        filteredMembers: members, 
        isLoading: false,
        loading: false 
      });
      
      // Board members loaded successfully
    } catch (error) {
      console.error('Error fetching directiva:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch directiva',
        isLoading: false,
        loading: false 
      });
    }
  },

  setSearchTerm: (searchTerm: string) => {
    set({ searchTerm });
    get().applyFilters();
  },

  setFilters: (newFilters: Partial<GalleryState['filters']>) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters }
    }));
    get().applyFilters();
  },

  setSelectedYear: (selectedYear: number) => {
    set({ selectedYear });
    get().applyFilters();
  },

  openMemberModal: (selectedMember: Member) => {
    set({ selectedMember, isModalOpen: true });
  },

  closeMemberModal: () => {
    set({ selectedMember: null, isModalOpen: false });
  },

  toggleMemberType: (type: string) => {
    const { filters } = get();
    const memberTypes = filters.memberTypes.includes(type)
      ? filters.memberTypes.filter(t => t !== type)
      : [...filters.memberTypes, type];
    
    get().setFilters({ memberTypes });
  },

  toggleSpecialization: (spec: string) => {
    const { filters } = get();
    const specializations = filters.specializations.includes(spec)
      ? filters.specializations.filter(s => s !== spec)
      : [...filters.specializations, spec];
    
    get().setFilters({ specializations });
  },

  toggleLocation: (location: string) => {
    const { filters } = get();
    const locations = filters.locations.includes(location)
      ? filters.locations.filter(l => l !== location)
      : [...filters.locations, location];
    
    get().setFilters({ locations });
  },

  toggleAvailabilityStatus: (status: string) => {
    const { filters } = get();
    const availabilityStatus = filters.availabilityStatus.includes(status)
      ? filters.availabilityStatus.filter(s => s !== status)
      : [...filters.availabilityStatus, status];
    
    get().setFilters({ availabilityStatus });
  },

  applyFilters: () => {
    const { members, searchTerm, filters } = get();
    
    let filtered = [...members];

    // Apply search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(member =>
        member.first_name?.toLowerCase().includes(term) ||
        member.last_name?.toLowerCase().includes(term) ||
        member.display_name?.toLowerCase().includes(term) ||
        member.main_profession?.toLowerCase().includes(term) ||
        member.company?.toLowerCase().includes(term) ||
        member.other_professions?.some(prof => prof.toLowerCase().includes(term))
      );
    }

    // Apply member type filter
    if (filters.memberTypes.length > 0) {
      filtered = filtered.filter(member =>
        member.membership_type && filters.memberTypes.includes(member.membership_type)
      );
    }

    // Apply location filter
    if (filters.locations.length > 0) {
      filtered = filtered.filter(member =>
        member.autonomous_community && filters.locations.includes(member.autonomous_community)
      );
    }

    // Apply active filter using Stripe-centric logic
    if (filters.isActive !== null) {
      filtered = filtered.filter(member => 
        filters.isActive ? isActiveMember(member) : !isActiveMember(member)
      );
    }

    // Apply social media filter
    if (filters.hasSocialMedia !== null) {
      if (filters.hasSocialMedia) {
        filtered = filtered.filter(member =>
          member.social_media && Object.values(member.social_media).some(value => !!value)
        );
      } else {
        filtered = filtered.filter(member =>
          !member.social_media || !Object.values(member.social_media).some(value => !!value)
        );
      }
    }

    set({ filteredMembers: filtered });
  },

  getFilteredMembers: () => {
    return get().filteredMembers.map(member => ({
      ...member, // Pass through all original member data
      id: member.id,
      firstName: member.first_name || '',
      lastName: member.last_name || '',
      displayName: member.display_name || `${member.first_name || ''} ${member.last_name || ''}`.trim(),
      location: {
        city: member.city || member.address || '',
        region: member.autonomous_community || member.province || '',
        country: member.country || 'España'
      },
      memberType: member.membership_type || 'profesional',
      profession: member.main_profession || '',
      company: member.company || '',
      availabilityStatus: 'Available', // Default since there's no availability_status field
      specializations: member.other_professions || [],
      socialMedia: member.social_media || {},
      profileImage: member.profile_image_url || '', // Fixed mapping
      // Additional fields for enhanced modal
      biography: member.biography || '',
      bio: member.biography || '', // Alias for backwards compatibility
      professional_role: member.professional_role,
      employment_status: member.employment_status,
      years_experience: member.years_experience,
      education_level: member.education_level,
      studies_completed: member.studies_completed,
      educational_institution: member.educational_institution,
      phone: member.phone,
      address: member.address,
      province: member.province,
      autonomous_community: member.autonomous_community,
      country: member.country,
      // Active status using Stripe logic
      isActive: isActiveMember(member),
      // Membership status
      stripeSubscriptionStatus: member.stripe_subscription_status,
      subscriptionEndDate: member.subscription_current_period_end
    }));
  },

  getFilteredDirectiva: () => {
    const { members, selectedYear } = get();
    // Filtering board members for selected year
    
    // Filter for board members using our new schema
    const boardMembers = members.filter(member => {
      const isBoardMember = member.is_board_member === true;
      
      // Check if board term is active for selected year
      const termStart = member.board_term_start ? new Date(member.board_term_start).getFullYear() : null;
      const termEnd = member.board_term_end ? new Date(member.board_term_end).getFullYear() : null;
      
      const isActiveForYear = termStart ? 
        (termStart <= selectedYear && (!termEnd || termEnd >= selectedYear)) : true;
      
      // Check if board member is active for selected year
      
      return isBoardMember && isActiveForYear;
    });
    
    // Board members filtered for selected year
    
    return boardMembers.map(member => ({
      ...member,
      id: member.id,
      position: member.board_position || 'Miembro de Junta',
      responsibilities: getPositionResponsibilities(member.board_position || ''),
      yearServed: getYearsServed(member.board_term_start, member.board_term_end, selectedYear),
      isCurrentMember: selectedYear === new Date().getFullYear(),
      firstName: member.first_name || '',
      lastName: member.last_name || '',
      profileImage: member.profile_image_url || '', // Fixed mapping
      location: {
        city: member.city || member.address || '',
        region: member.autonomous_community || member.province || '',
        country: member.country || 'España'
      },
      memberType: member.membership_type || 'profesional',
      profession: member.main_profession || '',
      company: member.company || '',
      bio: member.biography || '',
      biography: member.biography || '',
      specializations: member.other_professions || [],
      socialMedia: member.social_media || {},
      joinDate: member.created_at || new Date().toISOString(),
      previousPositions: [] // Could be enhanced later
    }));
  },

  getAvailableLocations: () => {
    const { members } = get();
    const locations = members
      .map(member => member.autonomous_community || member.province)
      .filter((location): location is string => !!location);
    return [...new Set(locations)].sort();
  },

  getMemberCounts: () => {
    const { members } = get();
    const byType: Record<string, number> = {};
    const byAvailability: Record<string, number> = { 'Available': 0 };
    
    members.forEach(member => {
      // Count by membership type
      if (member.membership_type) {
        byType[member.membership_type] = (byType[member.membership_type] || 0) + 1;
      }
      
      // Count by availability status (defaulting to Available)
      byAvailability['Available'] = byAvailability['Available'] + 1;
    });
    
    return {
      total: members.length,
      active: members.filter(member => isActiveMember(member)).length,
      byType,
      byAvailability
    };
  },

  resetFilters: () => {
    set({ 
      filters: initialFilters, 
      searchTerm: '',
      filteredMembers: get().members 
    });
  },
}));

// Helper function to get position responsibilities
function getPositionResponsibilities(position: string): string[] {
  const responsibilities: Record<string, string[]> = {
    'Presidenta': [
      'Dirigir las sesiones de la junta directiva',
      'Representar a MIA en eventos públicos',
      'Supervisar la estrategia organizacional',
      'Coordinación con otras organizaciones del sector'
    ],
    'Secretaria': [
      'Redactar actas de las reuniones',
      'Gestionar la correspondencia oficial',
      'Mantener registros organizacionales',
      'Coordinar comunicaciones internas'
    ],
    'Tesorera': [
      'Gestionar las finanzas de la organización',
      'Preparar informes financieros',
      'Supervisar presupuestos y gastos',
      'Coordinar con proveedores y patrocinadores'
    ],
    'Vocal': [
      'Participar en decisiones de la junta',
      'Apoyar iniciativas organizacionales',
      'Representar intereses de los miembros',
      'Colaborar en proyectos especiales'
    ]
  };
  
  return responsibilities[position] || [
    'Participar en decisiones de la junta directiva',
    'Colaborar en iniciativas organizacionales',
    'Representar los intereses de los miembros'
  ];
}

// Helper function to get years served
function getYearsServed(startDate?: string, endDate?: string, selectedYear?: number): number[] {
  if (!startDate) return selectedYear ? [selectedYear] : [new Date().getFullYear()];
  
  const start = new Date(startDate).getFullYear();
  const end = endDate ? new Date(endDate).getFullYear() : new Date().getFullYear();
  
  const years = [];
  for (let year = start; year <= end; year++) {
    years.push(year);
  }
  
  return years.length > 0 ? years : [selectedYear || new Date().getFullYear()];
}

export default useGalleryStore;
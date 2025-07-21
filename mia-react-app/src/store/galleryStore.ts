import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { 
  Member, 
  DirectivaMember, 
  FilterState, 
  GalleryState
} from '../types';

interface GalleryActions {
  // Filter actions
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  toggleMemberType: (type: 'Full' | 'Student' | 'Collaborator') => void;
  toggleSpecialization: (specialization: string) => void;
  toggleLocation: (location: string) => void;
  toggleAvailabilityStatus: (status: 'Available' | 'Busy' | 'Not Available') => void;
  
  // Search actions
  setSearchTerm: (term: string) => void;
  
  // Year selection
  setSelectedYear: (year: number) => void;
  
  // Modal actions
  openMemberModal: (member: Member | DirectivaMember) => void;
  closeMemberModal: () => void;
  
  // Data fetching actions
  fetchMembers: () => Promise<void>;
  fetchDirectiva: (year: number) => Promise<void>;
  
  // Computed getters
  getFilteredMembers: () => Member[];
  getFilteredDirectiva: () => DirectivaMember[];
  getAvailableLocations: () => string[];
  getMemberCounts: () => {
    total: number;
    byType: Record<string, number>;
    byAvailability: Record<string, number>;
  };
}

const initialFilters: FilterState = {
  memberTypes: [],
  specializations: [],
  locations: [],
  availabilityStatus: [],
  hasSocialMedia: null,
  isActive: null,
};

const currentYear = new Date().getFullYear();

export const useGalleryStore = create<GalleryState & GalleryActions>()(
  devtools(
    (set, get) => ({
      // Initial state
      members: [],
      directiva: [],
      filters: initialFilters,
      searchTerm: '',
      loading: false,
      selectedYear: currentYear,
      availableYears: [currentYear, currentYear - 1, currentYear - 2, currentYear - 3],
      selectedMember: null,
      isModalOpen: false,

      // Filter actions
      setFilters: (newFilters) => 
        set((state) => ({
          filters: { ...state.filters, ...newFilters }
        })),

      resetFilters: () => 
        set({ filters: initialFilters, searchTerm: '' }),

      toggleMemberType: (type) =>
        set((state) => ({
          filters: {
            ...state.filters,
            memberTypes: state.filters.memberTypes.includes(type)
              ? state.filters.memberTypes.filter(t => t !== type)
              : [...state.filters.memberTypes, type]
          }
        })),

      toggleSpecialization: (specialization) =>
        set((state) => ({
          filters: {
            ...state.filters,
            specializations: state.filters.specializations.includes(specialization)
              ? state.filters.specializations.filter(s => s !== specialization)
              : [...state.filters.specializations, specialization]
          }
        })),

      toggleLocation: (location) =>
        set((state) => ({
          filters: {
            ...state.filters,
            locations: state.filters.locations.includes(location)
              ? state.filters.locations.filter(l => l !== location)
              : [...state.filters.locations, location]
          }
        })),

      toggleAvailabilityStatus: (status) =>
        set((state) => ({
          filters: {
            ...state.filters,
            availabilityStatus: state.filters.availabilityStatus.includes(status)
              ? state.filters.availabilityStatus.filter(s => s !== status)
              : [...state.filters.availabilityStatus, status]
          }
        })),

      // Search actions
      setSearchTerm: (term) => set({ searchTerm: term }),

      // Year selection
      setSelectedYear: (year) => {
        set({ selectedYear: year });
        get().fetchDirectiva(year);
      },

      // Modal actions
      openMemberModal: (member) => 
        set({ selectedMember: member, isModalOpen: true }),

      closeMemberModal: () => 
        set({ selectedMember: null, isModalOpen: false }),

      // Data fetching actions
      fetchMembers: async () => {
        set({ loading: true });
        try {
          // Mock API call - replace with actual API endpoint
          const response = await fetch('/api/members');
          if (response.ok) {
            const members = await response.json();
            set({ members, loading: false });
          } else {
            // Fallback to mock data for development
            set({ members: generateMockMembers(), loading: false });
          }
        } catch (error) {
          console.error('Failed to fetch members:', error);
          // Use mock data for development
          set({ members: generateMockMembers(), loading: false });
        }
      },

      fetchDirectiva: async (year) => {
        set({ loading: true });
        try {
          // Mock API call - replace with actual API endpoint
          const response = await fetch(`/api/directiva/${year}`);
          if (response.ok) {
            const directiva = await response.json();
            set({ directiva, loading: false });
          } else {
            // Fallback to mock data for development
            set({ directiva: generateMockDirectiva(year), loading: false });
          }
        } catch (error) {
          console.error('Failed to fetch directiva:', error);
          // Use mock data for development
          set({ directiva: generateMockDirectiva(year), loading: false });
        }
      },

      // Computed getters
      getFilteredMembers: () => {
        const { members, filters, searchTerm } = get();
        
        return members.filter(member => {
          // Search filter
          if (searchTerm) {
            const search = searchTerm.toLowerCase();
            const matchesSearch = 
              member.firstName.toLowerCase().includes(search) ||
              member.lastName.toLowerCase().includes(search) ||
              member.company?.toLowerCase().includes(search) ||
              member.location.city?.toLowerCase().includes(search) ||
              member.location.region?.toLowerCase().includes(search) ||
              member.location.country.toLowerCase().includes(search) ||
              member.specializations.some(spec => 
                spec.toLowerCase().includes(search)
              );
            
            if (!matchesSearch) return false;
          }

          // Member type filter
          if (filters.memberTypes.length > 0 && 
              !filters.memberTypes.includes(member.memberType)) {
            return false;
          }

          // Specializations filter
          if (filters.specializations.length > 0 &&
              !filters.specializations.some(spec => 
                member.specializations.includes(spec)
              )) {
            return false;
          }

          // Location filter
          if (filters.locations.length > 0) {
            const memberLocation = `${member.location.city || ''} ${member.location.region || ''} ${member.location.country}`.trim();
            const matchesLocation = filters.locations.some(loc =>
              memberLocation.toLowerCase().includes(loc.toLowerCase())
            );
            if (!matchesLocation) return false;
          }

          // Availability status filter
          if (filters.availabilityStatus.length > 0 &&
              !filters.availabilityStatus.includes(member.availabilityStatus)) {
            return false;
          }

          // Social media presence filter
          if (filters.hasSocialMedia !== null) {
            const hasSocial = Object.values(member.socialMedia).some(Boolean);
            if (filters.hasSocialMedia && !hasSocial) return false;
            if (!filters.hasSocialMedia && hasSocial) return false;
          }

          // Active status filter
          if (filters.isActive !== null && member.isActive !== filters.isActive) {
            return false;
          }

          return true;
        });
      },

      getFilteredDirectiva: () => {
        const { directiva, searchTerm, selectedYear } = get();
        
        return directiva
          .filter(member => member.yearServed.includes(selectedYear))
          .filter(member => {
            if (searchTerm) {
              const search = searchTerm.toLowerCase();
              return (
                member.firstName.toLowerCase().includes(search) ||
                member.lastName.toLowerCase().includes(search) ||
                member.position.toLowerCase().includes(search) ||
                member.responsibilities.some(resp => 
                  resp.toLowerCase().includes(search)
                )
              );
            }
            return true;
          })
          .sort((a, b) => {
            // Sort by position hierarchy (custom logic can be added)
            const positionOrder = ['Presidenta', 'Vicepresidenta', 'Secretaria', 'Tesorera'];
            const aIndex = positionOrder.indexOf(a.position);
            const bIndex = positionOrder.indexOf(b.position);
            
            if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
            if (aIndex !== -1) return -1;
            if (bIndex !== -1) return 1;
            
            return a.position.localeCompare(b.position);
          });
      },

      getAvailableLocations: () => {
        const { members } = get();
        const locations = new Set<string>();
        
        members.forEach(member => {
          if (member.location.city) locations.add(member.location.city);
          if (member.location.region) locations.add(member.location.region);
          locations.add(member.location.country);
        });
        
        return Array.from(locations).sort();
      },

      getMemberCounts: () => {
        const filteredMembers = get().getFilteredMembers();
        
        const byType = filteredMembers.reduce((acc, member) => {
          acc[member.memberType] = (acc[member.memberType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const byAvailability = filteredMembers.reduce((acc, member) => {
          acc[member.availabilityStatus] = (acc[member.availabilityStatus] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        return {
          total: filteredMembers.length,
          byType,
          byAvailability,
        };
      },
    }),
    { name: 'gallery-store' }
  )
);

// Mock data generators for development
function generateMockMembers(): Member[] {
  const mockMembers: Member[] = [
    {
      id: '1',
      firstName: 'María',
      lastName: 'García',
      email: 'maria.garcia@example.com',
      company: 'Animación Studios',
      location: { city: 'Madrid', region: 'Comunidad de Madrid', country: 'España' },
      memberType: 'Full',
      specializations: ['2D Animation', 'Character Design'],
      availabilityStatus: 'Available',
      socialMedia: {
        linkedin: 'https://linkedin.com/in/mariagarcia',
        twitter: '@mariagarcia'
      },
      profileImage: 'https://via.placeholder.com/150',
      bio: 'Experienced 2D animator with over 10 years in the industry.',
      joinDate: '2020-01-15',
      isActive: true,
    },
    {
      id: '2',
      firstName: 'Carmen',
      lastName: 'López',
      email: 'carmen.lopez@example.com',
      company: 'Freelance',
      location: { city: 'Barcelona', region: 'Cataluña', country: 'España' },
      memberType: 'Student',
      specializations: ['3D Animation', 'Modeling'],
      availabilityStatus: 'Busy',
      socialMedia: {
        website: 'https://carmenlopez.com'
      },
      profileImage: 'https://via.placeholder.com/150',
      bio: 'Animation student specializing in 3D character work.',
      joinDate: '2023-09-01',
      isActive: true,
    },
    // Add more mock members as needed
  ];
  
  return mockMembers;
}

function generateMockDirectiva(year: number): DirectivaMember[] {
  const mockDirectiva: DirectivaMember[] = [
    {
      id: 'd1',
      firstName: 'Ana',
      lastName: 'Martínez',
      email: 'ana.martinez@mia.com',
      company: 'MIA',
      location: { city: 'Madrid', region: 'Comunidad de Madrid', country: 'España' },
      memberType: 'Full',
      specializations: ['Direction', 'Production'],
      availabilityStatus: 'Busy',
      socialMedia: {
        linkedin: 'https://linkedin.com/in/anamartinez'
      },
      profileImage: 'https://via.placeholder.com/150',
      bio: 'President of MIA with extensive experience in animation production.',
      joinDate: '2018-01-01',
      isActive: true,
      position: 'Presidenta',
      responsibilities: ['Strategic planning', 'External relations', 'Board leadership'],
      yearServed: [year, year - 1],
      isCurrentMember: year === new Date().getFullYear(),
    },
    // Add more mock directiva members as needed
  ];
  
  return mockDirectiva;
}
import { create } from 'zustand';
import { memberService, isActiveMember, supabase } from '../services/supabaseService';
import type { 
  Member, 
  BoardPosition, 
  BoardPositionHistory, 
  BoardPositionResponsibilities,
  BoardMemberWithHistory,
  BoardPeriod,
  DirectivaPageData
} from '../types/supabase';
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
  
  // Board-specific state
  boardMembers: BoardMemberWithHistory[];
  boardPositionHistory: BoardPositionHistory[];
  boardResponsibilities: BoardPositionResponsibilities[];
  selectedPeriod: string; // Format: "2025-2026"
  availablePeriods: string[];
  directivaData: DirectivaPageData | null;
  
  // Actions
  fetchMembers: () => Promise<void>;
  fetchDirectiva: () => Promise<void>;
  fetchBoardData: () => Promise<void>;
  fetchBoardPositionHistory: () => Promise<void>;
  fetchBoardResponsibilities: () => Promise<void>;
  setSearchTerm: (term: string) => void;
  setFilters: (filters: Partial<GalleryState['filters']>) => void;
  setSelectedYear: (year: number) => void;
  setSelectedPeriod: (period: string) => void;
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
  getBoardMembersForPeriod: (period?: string) => BoardMemberWithHistory[];
  getCurrentBoardMembers: () => BoardMemberWithHistory[];
  getAvailableLocations: () => string[];
  getPositionResponsibilitiesFromDB: (position: string) => string[];
  getAvailablePeriods: () => string[];
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
  
  // Board-specific state
  boardMembers: [],
  boardPositionHistory: [],
  boardResponsibilities: [],
  selectedPeriod: '2025-2026', // Current period
  availablePeriods: ['2025-2026', '2023-2024', '2021-2022', '2019-2020', '2018'],
  directivaData: null,

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

  fetchBoardData: async () => {
    set({ isLoading: true, loading: true, error: null });
    
    try {
      // Fetch all board-related data in parallel
      const [boardMembers, positionHistory, responsibilities] = await Promise.all([
        memberService.getBoardMembers(),
        get().fetchBoardPositionHistory(),
        get().fetchBoardResponsibilities()
      ]);
      
      // Debug logging
      console.log('Fetched board members count:', boardMembers.length);
      console.log('Board members with 2025-2026 terms:', boardMembers.filter(m => m.board_term_start?.includes('2025')));
      
      // Clean and process board members
      const cleanedBoardMembers = boardMembers.map(member => cleanMemberData(member));
      
      // Create board members with history
      const boardMembersWithHistory: BoardMemberWithHistory[] = cleanedBoardMembers.map(member => ({
        ...member,
        position_history: get().boardPositionHistory.filter(history => history.member_id === member.id),
        position_responsibilities: get().getPositionResponsibilitiesFromDB(member.board_position || 'Vocal')
      }));
      
      set({ 
        boardMembers: boardMembersWithHistory,
        isLoading: false,
        loading: false
      });
      
    } catch (error) {
      console.error('Error fetching board data:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch board data',
        isLoading: false,
        loading: false
      });
    }
  },

  fetchBoardPositionHistory: async () => {
    try {
      const { data, error } = await supabase
        .from('board_position_history')
        .select('*')
        .order('term_start', { ascending: false });

      if (error) {
        console.warn('board_position_history table not available:', error.message);
        const positionHistory: BoardPositionHistory[] = [];
        set({ boardPositionHistory: positionHistory });
        return positionHistory;
      }

      const positionHistory: BoardPositionHistory[] = data || [];
      set({ boardPositionHistory: positionHistory });
      return positionHistory;
    } catch (error) {
      console.error('Error fetching board position history:', error);
      return [];
    }
  },

  fetchBoardResponsibilities: async () => {
    try {
      const { data, error } = await supabase
        .from('board_position_responsibilities')
        .select('*')
        .order('position');

      if (error) {
        console.warn('board_position_responsibilities table not available:', error.message);
        const responsibilities: BoardPositionResponsibilities[] = [];
        set({ boardResponsibilities: responsibilities });
        return responsibilities;
      }

      const responsibilities: BoardPositionResponsibilities[] = data || [];
      set({ boardResponsibilities: responsibilities });
      return responsibilities;
    } catch (error) {
      console.error('Error fetching board responsibilities:', error);
      return [];
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

  setSelectedPeriod: (selectedPeriod: string) => {
    set({ selectedPeriod });
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

    // Member type filter removed - no longer filtering by membership type

    // Apply location filter
    if (filters.locations.length > 0) {
      filtered = filtered.filter(member =>
        member.autonomous_community && filters.locations.includes(member.autonomous_community)
      );
    }

    // Apply availability status filter
    if (filters.availabilityStatus.length > 0) {
      filtered = filtered.filter(member => {
        const availability = member.availability_status || 'Disponible';
        return filters.availabilityStatus.includes(availability);
      });
    }

    // Apply specialization filter
    if (filters.specializations.length > 0) {
      filtered = filtered.filter(member =>
        member.other_professions && 
        filters.specializations.some(spec => 
          member.other_professions?.includes(spec)
        )
      );
    }

    // Active filter removed - no longer filtering by membership status

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
      memberType: member.membership_type || 'colaborador',
      profession: member.main_profession || '',
      company: member.company || '',
      availabilityStatus: member.availability_status || 'Disponible',
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
      memberType: member.membership_type || 'colaborador',
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

  getBoardMembersForPeriod: (period?: string) => {
    const { boardMembers, selectedPeriod, boardResponsibilities } = get();
    const targetPeriod = period || selectedPeriod;
    
    console.log('getBoardMembersForPeriod called with:', { period, targetPeriod, boardMembersCount: boardMembers.length });
    
    const filtered = boardMembers.filter(member => {
      if (!member.board_term_start) return false;
      
      // Parse dates more carefully to avoid timezone issues
      const startDate = new Date(member.board_term_start + 'T00:00:00');
      const endDate = member.board_term_end ? new Date(member.board_term_end + 'T00:00:00') : new Date();
      
      const startYear = startDate.getFullYear();
      const endYear = endDate.getFullYear();
      const memberPeriod = `${startYear}-${endYear}`;
      
      console.log('Member period check:', { 
        memberName: `${member.first_name} ${member.last_name}`, 
        memberPeriod, 
        targetPeriod, 
        matches: memberPeriod === targetPeriod 
      });
      
      return memberPeriod === targetPeriod;
    });
    
    // Sort board members using database sort_order from board_position_responsibilities
    const sorted = filtered.sort((a, b) => {
      const positionA = boardResponsibilities.find(r => r.position === a.board_position);
      const positionB = boardResponsibilities.find(r => r.position === b.board_position);
      
      const orderA = positionA?.sort_order || 999;
      const orderB = positionB?.sort_order || 999;
      
      return orderA - orderB;
    });
    
    console.log('Filtered and sorted members for period', targetPeriod, ':', sorted.length);
    return sorted;
  },

  getCurrentBoardMembers: () => {
    const { boardMembers, boardResponsibilities } = get();
    const currentYear = new Date().getFullYear();
    
    const filtered = boardMembers.filter(member => {
      if (!member.board_term_start) return false;
      
      const startDate = new Date(member.board_term_start + 'T00:00:00');
      const endDate = member.board_term_end ? new Date(member.board_term_end + 'T00:00:00') : new Date();
      
      const termStart = startDate.getFullYear();
      const termEnd = endDate.getFullYear();
      
      return termStart <= currentYear && (!member.board_term_end || termEnd >= currentYear);
    });
    
    // Sort board members using database sort_order from board_position_responsibilities
    return filtered.sort((a, b) => {
      const positionA = boardResponsibilities.find(r => r.position === a.board_position);
      const positionB = boardResponsibilities.find(r => r.position === b.board_position);
      
      const orderA = positionA?.sort_order || 999;
      const orderB = positionB?.sort_order || 999;
      
      return orderA - orderB;
    });
  },

  getAvailableLocations: () => {
    const { members } = get();
    const locations = members
      .map(member => member.autonomous_community || member.province)
      .filter((location): location is string => !!location);
    return [...new Set(locations)].sort();
  },

  getPositionResponsibilitiesFromDB: (position: string) => {
    const { boardResponsibilities } = get();
    const responsibility = boardResponsibilities.find(r => r.position === position);
    return responsibility?.default_responsibilities || getPositionResponsibilities(position);
  },

  getAvailablePeriods: () => {
    const { boardMembers, boardPositionHistory } = get();
    
    // Get all unique periods from current board members and history
    const periods = new Set<string>();
    
    // Add periods from current board members
    boardMembers.forEach(member => {
      if (member.board_term_start) {
        const startDate = new Date(member.board_term_start + 'T00:00:00');
        const endDate = member.board_term_end ? new Date(member.board_term_end + 'T00:00:00') : new Date();
        const startYear = startDate.getFullYear();
        const endYear = endDate.getFullYear();
        periods.add(`${startYear}-${endYear}`);
      }
    });
    
    // Add periods from historical data
    boardPositionHistory.forEach(history => {
      if (history.term_start) {
        const startDate = new Date(history.term_start + 'T00:00:00');
        const endDate = history.term_end ? new Date(history.term_end + 'T00:00:00') : new Date();
        const startYear = startDate.getFullYear();
        const endYear = endDate.getFullYear();
        periods.add(`${startYear}-${endYear}`);
      }
    });
    
    // Convert to array and sort (newest first)
    const sortedPeriods = Array.from(periods).sort((a, b) => {
      const aStart = parseInt(a.split('-')[0]);
      const bStart = parseInt(b.split('-')[0]);
      return bStart - aStart;
    });
    
    // Always include current period and fallback periods
    const defaultPeriods = ['2025-2026', '2023-2024', '2021-2022', '2019-2020', '2018'];
    
    // Merge with default periods and remove duplicates
    const allPeriods = [...new Set([...sortedPeriods, ...defaultPeriods])].sort((a, b) => {
      const aStart = parseInt(a.split('-')[0]);
      const bStart = parseInt(b.split('-')[0]);
      return bStart - aStart;
    });
    
    return allPeriods;
  },

  getMemberCounts: () => {
    const { members } = get();
    const byType: Record<string, number> = {};
    const byAvailability: Record<string, number> = {};
    
    members.forEach(member => {
      // Count by membership type
      if (member.membership_type) {
        byType[member.membership_type] = (byType[member.membership_type] || 0) + 1;
      }
      
      // Count by availability status
      const availability = member.availability_status || 'Available';
      byAvailability[availability] = (byAvailability[availability] || 0) + 1;
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
function getPositionResponsibilities(position: BoardPosition | string): string[] {
  const responsibilities: Record<BoardPosition, string[]> = {
    'Presidenta': [
      'Representar legalmente a la asociación',
      'Convocar y presidir las reuniones de la Junta Directiva',
      'Ejecutar los acuerdos adoptados por la Asamblea General',
      'Supervisar el cumplimiento de los estatutos y reglamentos',
      'Mantener relaciones institucionales con otras organizaciones'
    ],
    'Vice-Presidenta': [
      'Sustituir a la Presidenta en caso de ausencia',
      'Colaborar en la representación de la asociación',
      'Apoyar en la coordinación de actividades',
      'Participar en la toma de decisiones estratégicas',
      'Facilitar la comunicación entre miembros de la Junta'
    ],
    'Secretaria': [
      'Redactar y custodiar las actas de las reuniones',
      'Gestionar la correspondencia oficial de la asociación',
      'Mantener actualizado el registro de socias',
      'Organizar la documentación administrativa',
      'Coordinar la comunicación interna y externa'
    ],
    'Tesorera': [
      'Gestionar las finanzas de la asociación',
      'Elaborar presupuestos anuales',
      'Controlar ingresos y gastos',
      'Presentar informes financieros periódicos',
      'Mantener la contabilidad actualizada'
    ],
    'Vocal Formacion': [
      'Organizar cursos y talleres de formación',
      'Coordinar programas educativos',
      'Gestionar colaboraciones con instituciones formativas',
      'Desarrollar contenidos pedagógicos',
      'Evaluar la calidad de las actividades formativas'
    ],
    'Vocal Comunicacion': [
      'Gestionar las redes sociales de la asociación',
      'Coordinar la comunicación digital',
      'Elaborar materiales promocionales',
      'Mantener la página web actualizada',
      'Organizar eventos de difusión'
    ],
    'Vocal Mianima': [
      'Coordinar el festival MIANIMA',
      'Gestionar la programación del evento',
      'Organizar actividades paralelas',
      'Coordinar con patrocinadores del festival',
      'Supervisar la logística del evento'
    ],
    'Vocal Financiacion': [
      'Buscar fuentes de financiación',
      'Elaborar propuestas de subvenciones',
      'Gestionar relaciones con patrocinadores',
      'Coordinar campañas de crowdfunding',
      'Desarrollar estrategias de sostenibilidad económica'
    ],
    'Vocal Socias': [
      'Gestionar el proceso de incorporación de nuevas socias',
      'Organizar actividades de networking',
      'Coordinar programas de mentoría',
      'Facilitar la integración de nuevas miembros',
      'Mantener el contacto directo con las socias'
    ],
    'Vocal Festivales': [
      'Coordinar la participación en festivales externos',
      'Gestionar la presencia de MIA en eventos del sector',
      'Organizar proyecciones y muestras',
      'Coordinar con otros festivales de animación',
      'Desarrollar estrategias de visibilidad'
    ],
    'Vocal': [
      'Participar en las decisiones de la Junta Directiva',
      'Colaborar en proyectos específicos',
      'Apoyar a otros vocales en sus funciones',
      'Representar a la asociación en eventos',
      'Contribuir al desarrollo de nuevas iniciativas'
    ]
  };
  
  return responsibilities[position as BoardPosition] || [
    'Participar en las decisiones de la Junta Directiva',
    'Colaborar en proyectos específicos',
    'Representar a la asociación en eventos'
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
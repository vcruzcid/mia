export interface MembershipType {
  id: string;
  name: string;
  description: string;
  price: number;
  stripeLinkKey: keyof typeof import('../config/site.config').siteConfig.stripe;
  benefits: string[];
}

export interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  membershipType: string;
  acceptTerms: boolean;
  acceptNewsletter: boolean;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  turnstileToken?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Gallery and Member types
export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  email: string;
  company?: string;
  location: {
    city?: string;
    region?: string;
    country: string;
  };
  memberType: 'socia-pleno-derecho' | 'colaborador';
  membershipType?: string;
  specializations: string[];
  availabilityStatus: 'Disponible' | 'Empleada' | 'Freelance';
  socialMedia: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    website?: string;
  };
  profileImage?: string;
  bio?: string;
  joinDate: string;
  isActive: boolean;
  status?: 'active' | 'pending' | 'expired';
  membershipStatus?: 'active' | 'pending' | 'expired';
}

export interface DirectivaMember extends Member {
  position: string;
  responsibilities: string[];
  yearServed: number[];
  isCurrentMember: boolean;
  previousPositions?: { position: string; year: number }[];
  board_term_start?: string;
  board_term_end?: string;
  board_personal_commitment?: string;
  position_history?: any[];
}

export interface FilterState {
  memberTypes: ('socia-pleno-derecho' | 'colaborador')[];
  specializations: string[];
  locations: string[];
  availabilityStatus: ('Disponible' | 'Empleada' | 'Freelance')[];
  hasSocialMedia: boolean | null;
  isActive: boolean | null;
}

export interface GalleryState {
  members: Member[];
  directiva: DirectivaMember[];
  filters: FilterState;
  searchTerm: string;
  loading: boolean;
  selectedYear: number;
  availableYears: number[];
  selectedMember: Member | DirectivaMember | null;
  isModalOpen: boolean;
}

// Animation profession categories constants
export const ANIMATION_SPECIALIZATIONS = [
  'Guión',
  'Dirección',
  'Storyboard',
  'Dirección de arte',
  'Concept Art',
  'Diseño de personajes',
  'Diseño de sets',
  'Visual Development',
  'Modelado 3D',
  'Motion Graphics',
  'Layout 2D',
  'Layout 3D',
  'Color BG',
  'Rigging 2D',
  'Rigging 3D',
  'Animación 2D',
  '2D FX',
  'Clean Up',
  'Ink and Paint',
  'Animación 3D',
  'Animación StopMotion',
  'Artista para Stopmotion',
  'Composición Digital',
  'Sonido/ Música/ SFX',
  'Montaje',
  'Pipeline',
  'Producción',
  'Asistente de producción',
  'Directora de producción',
  'Coordinadora de producción',
  'Line producer',
  'Producción ejecutiva',
  'Matte painting',
  'Render wrangler',
  'Lighting',
  'Shading',
  'Marketing',
  'Groom artist',
  'Compositora musical'
] as const;

export type AnimationSpecialization = typeof ANIMATION_SPECIALIZATIONS[number];

// Router location state types
export interface LocationState {
  from?: {
    pathname: string;
  };
}
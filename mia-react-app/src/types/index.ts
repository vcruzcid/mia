export interface MembershipType {
  id: string;
  name: string;
  description: string;
  price: number;
  stripeLinkKey: keyof typeof import('../config/site.config').siteConfig.stripe | 'newsletter';
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
  email: string;
  company?: string;
  location: {
    city?: string;
    region?: string;
    country: string;
  };
  memberType: 'Full' | 'Student' | 'Collaborator';
  specializations: string[];
  availabilityStatus: 'Available' | 'Busy' | 'Not Available';
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
}

export interface DirectivaMember extends Member {
  position: string;
  responsibilities: string[];
  yearServed: number[];
  isCurrentMember: boolean;
  previousPositions?: { position: string; year: number }[];
}

export interface FilterState {
  memberTypes: ('Full' | 'Student' | 'Collaborator')[];
  specializations: string[];
  locations: string[];
  availabilityStatus: ('Available' | 'Busy' | 'Not Available')[];
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

// Animation specializations constants
export const ANIMATION_SPECIALIZATIONS = [
  '2D Animation',
  '3D Animation',
  'Stop Motion',
  'Character Design',
  'Background Art',
  'Storyboarding',
  'Concept Art',
  'Visual Development',
  'Layout',
  'Cleanup',
  'Inbetweening',
  'Coloring',
  'Compositing',
  'VFX',
  'Motion Graphics',
  'UI/UX Animation',
  'Game Animation',
  'Rigging',
  'Modeling',
  'Texturing',
  'Lighting',
  'Rendering',
  'Direction',
  'Production',
  'Producing',
  'Sound Design',
  'Voice Acting',
  'Music Composition',
  'Script Writing',
  'Technical Animation',
  'Pipeline Development',
  'Tools Programming',
  'Previz',
  'Animatics',
  'Educational Content',
  'Documentary',
  'Advertising',
  'Feature Film',
  'TV Series',
  'Web Series',
  'Mobile Content',
  'AR/VR Animation',
  'Interactive Media',
  'Projection Mapping',
  'Installation Art',
  'Art Direction',
  'Creative Direction',
  'Brand Animation',
  'Explainer Videos',
  'Medical Animation',
  'Scientific Visualization',
  'Architectural Visualization'
] as const;

export type AnimationSpecialization = typeof ANIMATION_SPECIALIZATIONS[number];
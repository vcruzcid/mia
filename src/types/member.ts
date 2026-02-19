// Standalone type definitions for members and board positions
// No Supabase dependencies

export interface Member {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  display_name?: string;
  member_number?: string;
  phone?: string;
  address: string;
  city: string;
  postal_code?: string;
  province?: string;
  autonomous_community?: string;
  country: string;
  main_profession?: string;
  other_professions?: string[];
  professional_role?: string;
  company?: string;
  years_experience?: number;
  biography?: string;
  employment_status?: string;
  availability_status?: string;
  education_level?: string;
  studies_completed?: string;
  educational_institution?: string;
  is_student?: boolean;
  membership_type: string;
  is_board_member?: boolean;
  board_position?: BoardPosition;
  board_term_start?: string;
  board_term_end?: string;
  board_personal_commitment?: string;
  accepts_newsletter?: boolean;
  accepts_job_offers?: boolean;
  privacy_level?: 'public' | 'members-only' | 'private';
  gdpr_accepted?: boolean;
  social_media?: {
    linkedin?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
    website?: string;
    youtube?: string;
    vimeo?: string;
    artstation?: string;
  };
  profile_image_url?: string;
  cv_document_url?: string;
  birth_date?: string;
  other_associations?: string[];
  created_at?: string;
  updated_at?: string;
}

// Board position types - all positions for women-only organization
export type BoardPosition =
  | 'Presidenta'
  | 'Vice-Presidenta'
  | 'Secretaria'
  | 'Tesorera'
  | 'Vocal Formacion'
  | 'Vocal Comunicacion'
  | 'Vocal Mianima'
  | 'Vocal Financiacion'
  | 'Vocal Socias'
  | 'Vocal Festivales'
  | 'Vocal';

// Board member type
export interface BoardMember {
  id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  position: BoardPosition;
  position_email?: string;
  position_responsibilities: string[];
  profile_image_url: string;
  company: string;
  membership_type: 'pleno_derecho' | 'estudiante' | 'colaborador';
  city: string;
  province?: string;
  autonomous_community?: string;
  country: string;
  biography: string;
  board_term_start: string;
  board_term_end: string;
  social_media: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    website?: string;
    vimeo?: string;
  };
  main_profession: string;
  other_professions: string[];
}

// Board term (a period of service with its members)
export interface BoardTerm {
  label: string;
  members: BoardMember[];
  isCurrent: boolean;
}

// Fundadora — minimal type for fields rendered in FundadorasPage
export interface Fundadora {
  id: string;
  display_name: string;
  main_profession?: string;
  company?: string;
  biography?: string;
  profile_image_url?: string;
  city?: string;
  country: string;
  social_media: {
    linkedin?: string;
    instagram?: string;
    twitter?: string;
    website?: string;
  };
  other_professions?: string[];
  is_founder: boolean;
}

// Member statistics
export interface MemberStats {
  total_members: number;
  active_members: number;
  board_members: number;
  professional_members: number;
  student_members: number;
  collaborator_members: number;
}

// Membership status
export interface MembershipStatus {
  isActive: boolean;
  subscriptionStatus?: string;
  subscriptionEnd?: string;
  membershipType: string;
}

import type { Member, FormData, ContactFormData } from './index';
import type { BoardMember } from './member';

// API Response interfaces
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Registration API interfaces
export interface RegistrationRequest extends FormData {
  discountCode?: string;
  turnstileToken: string;
  gdprAccepted: boolean;
}

export interface RegistrationResponse {
  success: boolean;
  message: string;
}

// Member API interfaces
export interface MembersRequest {
  search?: string;
  memberTypes?: string[];
  specializations?: string[];
  locations?: string[];
  availabilityStatus?: string[];
  hasSocialMedia?: boolean;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

export interface MembersResponse {
  members: Member[];
  total: number;
  limit: number;
  offset: number;
  filters: {
    availableLocations: string[];
    availableSpecializations: string[];
    memberTypeCounts: Record<string, number>;
  };
}

// Directiva API interfaces
export interface DirectivaRequest {
  year: number;
}

export interface DirectivaResponse {
  year: number;
  members: BoardMember[];
  positions: {
    position: string;
    member: BoardMember;
  }[];
  availableYears: number[];
}

// Contact form API interfaces
export interface ContactRequest extends ContactFormData {
  turnstileToken: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
}

// Turnstile verification
export interface TurnstileVerifyRequest {
  token: string;
  remoteip?: string;
}

export interface TurnstileVerifyResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
}

// Portal auth types
export interface MagicLinkResponse {
  success: boolean;
  magicLink?: string; // v1: returned directly (no email)
  error?: string;
}

export interface AuthMeResponse {
  success: boolean;
  member?: { email: string; contactId: string; nombre: string };
  error?: string;
}

export interface PortalProfile {
  contactId: string;
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  city: string;
  country: string;
  specializations: string[];
  socialLinks: { linkedin: string; instagram: string; twitter: string; website: string };
  membershipLevel: string;
  membershipStatus: string;
}

export interface PortalProfileResponse {
  success: boolean;
  profile?: PortalProfile;
  error?: string;
}

export interface CheckoutSessionResponse {
  success: boolean;
  name: string | null;
  payment_status: string;
  error?: string;
}

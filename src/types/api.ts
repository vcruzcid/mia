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

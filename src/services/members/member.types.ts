import type { Member } from '../../types/supabase';

export interface MemberFilters {
  membershipTypes?: string[];
  locations?: string[];
  professions?: string[];
  yearsExperience?: { min?: number; max?: number };
  activeOnly?: boolean;
  limit?: number;
  offset?: number;
}

export interface MemberProfile {
  basicInfo: Pick<Member, 'id' | 'email' | 'first_name' | 'last_name' | 'phone'>;
  address: Pick<Member, 'address' | 'city' | 'postal_code' | 'province' | 'country'>;
  professional: Pick<Member, 'main_profession' | 'company' | 'biography'>;
  membership: Pick<Member, 'membership_type' | 'stripe_subscription_status'>;
  preferences: Pick<Member, 'privacy_level' | 'accepts_newsletter' | 'accepts_job_offers'>;
}

export interface MembershipStatus {
  isActive: boolean;
  subscriptionStatus?: string;
  subscriptionEnd?: string;
  membershipType: string;
}


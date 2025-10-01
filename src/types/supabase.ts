// Generated types for Supabase integration with Stripe Foreign Data Wrapper
// Updated for Phase 4: Simplified Stripe-centric member schema

export interface Member {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  display_name?: string;
  member_number?: string;
  phone?: string;
  address: string; // Required for Stripe billing
  city: string; // Required for Stripe billing
  postal_code?: string;
  province?: string;
  autonomous_community?: string;
  country: string; // Required for Stripe billing, defaults to 'Spain'
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
  membership_type: string; // Required: 'profesional', 'estudiante', 'colaborador'
  stripe_customer_id: string; // Required for all members
  stripe_subscription_id?: string;
  stripe_subscription_status?: string;
  subscription_current_period_end?: string;
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
  last_login?: string;
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

// Separate table for board member management with terms
export interface BoardMember {
  id: string;
  member_id: string;
  position: BoardPosition;
  term_start: string;
  term_end: string;
  created_at?: string;
}

// Board position history for tracking past positions
export interface BoardPositionHistory {
  id: string;
  member_id: string;
  position: BoardPosition;
  term_start: string;
  term_end: string;
  created_at?: string;
  updated_at?: string;
}

// Board position responsibilities
export interface BoardPositionResponsibilities {
  id: string;
  position: BoardPosition;
  default_responsibilities: string[];
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

// Stripe Foreign Data Wrapper Types (unchanged)
export interface StripeCustomer {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  address_city?: string;
  address_state?: string;
  address_postal_code?: string;
  address_country?: string;
  created: string;
  updated: string;
  currency?: string;
  balance?: number;
  delinquent?: boolean;
  description?: string;
  metadata?: Record<string, string>;
  attrs?: Record<string, any>;
}

export interface StripeSubscription {
  id: string;
  customer: string;
  status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';
  current_period_start: string;
  current_period_end: string;
  created: string;
  cancel_at_period_end?: boolean;
  canceled_at?: string;
  ended_at?: string;
  trial_start?: string;
  trial_end?: string;
  metadata?: Record<string, string>;
  attrs?: Record<string, any>;
}

export interface StripeProduct {
  id: string;
  name: string;
  active: boolean;
  default_price?: string;
  description?: string;
  created: string;
  updated: string;
  metadata?: Record<string, string>;
  attrs?: Record<string, any>;
}

export interface StripePrice {
  id: string;
  product: string;
  active: boolean;
  currency: string;
  unit_amount?: number;
  recurring?: {
    interval: 'month' | 'year' | 'week' | 'day';
    interval_count: number;
  };
  metadata?: Record<string, string>;
  attrs?: Record<string, any>;
}

// View Types for our business logic views
export interface PublicMember extends Member {
  // Only active members with public privacy
}

export interface ActiveMember extends Member {
  // All members with stripe_subscription_status = 'active'
}

export interface CurrentBoardMember extends Member {
  // Board members with active terms
  board_position: BoardPosition;
  board_term_start: string;
  board_term_end?: string;
  board_personal_commitment?: string;
}

export interface MemberStats {
  total_members: number;
  active_members: number;
  board_members: number;
  professional_members: number;
  student_members: number;
  collaborator_members: number;
}

// Function return types
export interface MemberSyncResult {
  success: boolean;
  member_email?: string;
  stripe_customer_id?: string;
  subscription_status?: string;
  error?: string;
  updated_at?: string;
}

export interface BatchSyncResult {
  success: boolean;
  total_members: number;
  synced_successfully: number;
  errors: number;
  sync_timestamp: string;
}

export interface WebhookHandlerResult {
  success: boolean;
  event_type: string;
  customer_id: string;
  member_email?: string;
  affected_rows?: number;
  processed_at: string;
  error?: string;
}

export interface UpsertMemberResult {
  success: boolean;
  action: 'created' | 'updated';
  member_id: string;
  email: string;
  error?: string;
}

export interface BoardManagementResult {
  success: boolean;
  action: 'assigned' | 'removed';
  board_id?: string;
  member_email: string;
  position?: string;
  term_start?: string;
  term_end?: string;
  error?: string;
}

// Database table types for Supabase
export interface Database {
  public: {
    Tables: {
      members: {
        Row: Member;
        Insert: Omit<Member, 'id' | 'created_at' | 'updated_at'> & {
          stripe_customer_id: string; // Required
          address: string; // Required
          city: string; // Required
          country: string; // Required
          membership_type: string; // Required
        };
        Update: Partial<Omit<Member, 'id' | 'created_at'>>;
      };
      directiva: {
        Row: BoardMember;
        Insert: Omit<BoardMember, 'id' | 'created_at'>;
        Update: Partial<Omit<BoardMember, 'id' | 'created_at'>>;
      };
      board_position_history: {
        Row: BoardPositionHistory;
        Insert: Omit<BoardPositionHistory, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<BoardPositionHistory, 'id' | 'created_at' | 'updated_at'>>;
      };
      board_position_responsibilities: {
        Row: BoardPositionResponsibilities;
        Insert: Omit<BoardPositionResponsibilities, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<BoardPositionResponsibilities, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
    Views: {
      active_members: {
        Row: ActiveMember;
      };
      public_members: {
        Row: PublicMember;
      };
      board_members: {
        Row: CurrentBoardMember;
      };
      members_only: {
        Row: Member;
      };
      student_members: {
        Row: Member;
      };
      professional_members: {
        Row: Member;
      };
      member_stats: {
        Row: MemberStats;
      };
      member_search: {
        Row: Member;
      };
      member_stripe_data: {
        Row: Member & {
          stripe_name?: string;
          stripe_phone?: string;
          stripe_address?: string;
        };
      };
      expired_members: {
        Row: Member;
      };
    };
    Functions: {
      sync_member_stripe_status: {
        Args: { member_email: string };
        Returns: MemberSyncResult;
      };
      sync_all_members_with_stripe: {
        Args: Record<string, never>;
        Returns: BatchSyncResult;
      };
      handle_stripe_webhook: {
        Args: { 
          event_type: string; 
          customer_id: string; 
          subscription_data?: Record<string, any> 
        };
        Returns: WebhookHandlerResult;
      };
      upsert_member: {
        Args: { 
          p_email: string;
          p_first_name?: string;
          p_last_name?: string;
          p_stripe_customer_id?: string;
          p_phone?: string;
          p_additional_data?: Record<string, any>;
        };
        Returns: UpsertMemberResult;
      };
      manage_board_member: {
        Args: {
          p_member_email: string;
          p_position: string;
          p_term_start: string;
          p_term_end: string;
          p_action?: 'assign' | 'remove';
        };
        Returns: BoardManagementResult;
      };
    };
  };
  stripeschema: {
    Tables: {
      customers: {
        Row: StripeCustomer;
        Insert: never;
        Update: never;
      };
      subscriptions: {
        Row: StripeSubscription;
        Insert: never;
        Update: never;
      };
      products: {
        Row: StripeProduct;
        Insert: never;
        Update: never;
      };
      prices: {
        Row: StripePrice;
        Insert: never;
        Update: never;
      };
    };
  };
}

// Helper type for active membership check
export type ActiveMembershipStatus = 'active' | 'inactive';

// Utility function types
export interface MembershipStatus {
  isActive: boolean;
  subscriptionStatus?: string;
  subscriptionEnd?: string;
  membershipType: string;
}

export interface MemberProfile {
  basicInfo: Pick<Member, 'id' | 'email' | 'first_name' | 'last_name' | 'display_name' | 'phone'>;
  address: Pick<Member, 'address' | 'city' | 'postal_code' | 'province' | 'autonomous_community' | 'country'>;
  professional: Pick<Member, 'main_profession' | 'other_professions' | 'professional_role' | 'company' | 'years_experience' | 'employment_status'>;
  membership: Pick<Member, 'membership_type' | 'stripe_subscription_status' | 'is_board_member' | 'board_position'>;
  preferences: Pick<Member, 'privacy_level' | 'accepts_newsletter' | 'accepts_job_offers'>;
}

// Directiva page specific types
export interface BoardMemberWithHistory extends CurrentBoardMember {
  position_history: BoardPositionHistory[];
  position_responsibilities: string[];
}

export interface BoardPeriod {
  term_start: string;
  term_end: string;
  is_current: boolean;
  members: BoardMemberWithHistory[];
}

export interface DirectivaPageData {
  current_period: BoardPeriod;
  historical_periods: BoardPeriod[];
  all_responsibilities: Record<BoardPosition, string[]>;
}
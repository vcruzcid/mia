// Generated types for Supabase integration
// This file contains the TypeScript interfaces for the MIA members database

export interface Member {
  id: string;
  member_number?: number;
  first_name: string;
  last_name: string;
  display_name?: string;
  email: string;
  phone?: string;
  birth_date?: string;
  main_profession?: string;
  other_professions?: string[];
  company?: string;
  years_experience?: number;
  biography?: string;
  professional_role?: string;
  employment_status?: string;
  salary_range?: number;
  address?: string;
  postal_code?: string;
  province?: string;
  autonomous_community?: string;
  country?: string;
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
  education_level?: string;
  studies_completed?: string;
  educational_institution?: string;
  is_student?: boolean;
  membership_type?: string;
  is_board_member?: boolean;
  board_position?: string;
  is_active?: boolean;
  accepts_newsletter?: boolean;
  accepts_job_offers?: boolean;
  gdpr_accepted?: boolean;
  privacy_level?: 'public' | 'members-only' | 'private';
  personal_situation?: string;
  has_children?: boolean;
  work_life_balance?: boolean;
  experienced_gender_discrimination?: boolean;
  experienced_salary_discrimination?: boolean;
  experienced_sexual_harassment?: boolean;
  experienced_sexual_abuse?: boolean;
  experienced_glass_ceiling?: boolean;
  experienced_inequality_episode?: boolean;
  stripe_customer_id?: string;
  stripe_subscription_status?: string;
  other_associations?: string[];
  cv_document_url?: string;
  profile_image_url?: string;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
}

export interface MemberCategory {
  id: string;
  member_id: string;
  category_type: 'profession' | 'other_profession' | 'member_type' | 'board_role' | 'country';
  category_name: string;
  category_slug: string;
  is_primary?: boolean;
  created_at?: string;
}

export interface MemberActivity {
  id: string;
  member_id: string;
  activity_type: 'login' | 'profile_update' | 'registration' | 'payment';
  activity_data?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
}

export interface StripeCustomer {
  id: string;
  member_id: string;
  stripe_customer_id: string;
  customer_data?: Record<string, any>;
  last_sync?: string;
  created_at?: string;
}

export interface StripeSubscription {
  id: string;
  member_id: string;
  stripe_subscription_id: string;
  status: string;
  current_period_start?: string;
  current_period_end?: string;
  subscription_data?: Record<string, any>;
  last_sync?: string;
  created_at?: string;
}

// Database table types for Supabase
export interface Database {
  public: {
    Tables: {
      members: {
        Row: Member;
        Insert: Omit<Member, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Member, 'id' | 'created_at'>>;
      };
      member_categories: {
        Row: MemberCategory;
        Insert: Omit<MemberCategory, 'id' | 'created_at'>;
        Update: Partial<Omit<MemberCategory, 'id' | 'created_at'>>;
      };
      member_activity: {
        Row: MemberActivity;
        Insert: Omit<MemberActivity, 'id' | 'created_at'>;
        Update: Partial<Omit<MemberActivity, 'id' | 'created_at'>>;
      };
      stripe_customers: {
        Row: StripeCustomer;
        Insert: Omit<StripeCustomer, 'id' | 'created_at'>;
        Update: Partial<Omit<StripeCustomer, 'id' | 'created_at'>>;
      };
      stripe_subscriptions: {
        Row: StripeSubscription;
        Insert: Omit<StripeSubscription, 'id' | 'created_at'>;
        Update: Partial<Omit<StripeSubscription, 'id' | 'created_at'>>;
      };
    };
    Views: {
      public_members: {
        Row: Member & {
          professions?: string[];
          specializations?: string[];
        };
      };
      board_members: {
        Row: Member & {
          board_roles?: string[];
        };
      };
    };
    Functions: {
      get_member_by_email: {
        Args: { member_email: string };
        Returns: {
          id: string;
          first_name: string;
          last_name: string;
          display_name?: string;
          email: string;
          membership_type?: string;
          is_active: boolean;
        }[];
      };
      update_member_last_login: {
        Args: { member_email: string };
        Returns: void;
      };
    };
  };
}
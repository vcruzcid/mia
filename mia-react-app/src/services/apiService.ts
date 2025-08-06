import { memberService } from './supabaseService';
import type { Member } from '../types/supabase';

// Updated API service that uses Supabase instead of mock data
export class ApiService {
  private readonly baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

  // Members API - now using Supabase
  async getMembers(params: {
    search?: string;
    memberTypes?: string[];
    specializations?: string[];
    locations?: string[];
    availabilityStatus?: string[];
    hasSocialMedia?: boolean;
    isActive?: boolean;
    limit?: number;
    offset?: number;
  } = {}) {
    try {
      if (params.search) {
        return await memberService.searchMembers(params.search);
      } else {
        return await memberService.filterMembers(params);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      throw new Error('Failed to fetch members');
    }
  }

  // Get member by ID
  async getMemberById(id: string): Promise<Member> {
    try {
      return await memberService.getMemberById(id);
    } catch (error) {
      console.error('Error fetching member:', error);
      throw new Error('Failed to fetch member');
    }
  }

  // Get board members by year
  async getDirectivaByYear(year: number) {
    try {
      // For now, return current board members
      // Later, you can add year-based filtering to the database
      const boardMembers = await memberService.getBoardMembers();
      return boardMembers.map(member => ({
        ...member,
        year_served: [year],
        is_current_member: year === new Date().getFullYear()
      }));
    } catch (error) {
      console.error('Error fetching directiva:', error);
      throw new Error('Failed to fetch directiva');
    }
  }

  // Contact form (keep existing implementation)
  async submitContactForm(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
    turnstileToken: string;
  }) {
    try {
      const response = await fetch(`${this.baseURL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting contact form:', error);
      throw new Error('Failed to submit contact form');
    }
  }

  // Registration - add register method for compatibility
  async register(data: any) {
    return this.submitRegistration(data);
  }

  // Registration (keep existing implementation)
  async submitRegistration(data: any) {
    try {
      const response = await fetch(`${this.baseURL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting registration:', error);
      throw new Error('Failed to submit registration');
    }
  }

  // Health check
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'error', message: 'API unavailable' };
    }
  }
}

// Utility functions
export function getErrorMessage(error: any): string {
  if (error?.message) return error.message;
  if (typeof error === 'string') return error;
  return 'An unexpected error occurred';
}

export function getApiConfig() {
  return {
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    turnstileSecret: import.meta.env.TURNSTILE_SECRET_KEY,
    turnstileSiteKey: import.meta.env.VITE_TURNSTILE_SITE_KEY
  };
}

export const apiService = new ApiService();
export default apiService;
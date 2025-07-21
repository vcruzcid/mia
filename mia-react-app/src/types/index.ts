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

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
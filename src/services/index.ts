/**
 * Centralized Services Export
 * 
 * This file exports all services in a clean, modular way.
 * Services are organized by domain for better maintainability.
 */

// Client
export { supabase } from './supabase.client';

// Member Services
export * from './members/member.service';
export * from './members/member.types';

// Board Services
export * from './board/board.service';

// Auth Services
export * from './auth/auth.service';

// Stripe Services
export * from './stripe/stripe.service';
export * from './stripe/stripe.sync';
export * from './stripe/stripe.hooks';

// Storage Services
export * from './storage/storage.service';

// Backward compatibility exports
import * as memberService from './members/member.service';
import * as boardService from './board/board.service';
import * as authService from './auth/auth.service';
import * as stripeService from './stripe/stripe.service';
import * as stripeSyncService from './stripe/stripe.sync';
import * as storageService from './storage/storage.service';

export const services = {
  member: memberService,
  board: boardService,
  auth: authService,
  stripe: stripeService,
  stripeSync: stripeSyncService,
  storage: storageService
};

// Legacy supabaseService export for backward compatibility
export const supabaseService = {
  // Member functions
  getPublicMembers: memberService.getPublicMembers,
  getActiveMembers: memberService.getActiveMembers,
  getBoardMembers: boardService.getBoardMembers,
  getAllMembers: memberService.getAllMembers,
  getMemberById: memberService.getMemberById,
  getMemberByEmail: memberService.getMemberByEmail,
  searchMembers: memberService.searchMembers,
  filterMembers: memberService.filterMembers,
  updateMemberProfile: memberService.updateMemberProfile,
  isActiveMember: memberService.isActiveMember,
  getMemberDisplayName: memberService.getMemberDisplayName,

  // Auth functions
  sendMagicLink: authService.sendMagicLink,
  verifyMagicLink: authService.verifyMagicLink,
  signOut: authService.signOut,
  getCurrentSession: authService.getCurrentSession,
  updateLastLogin: authService.updateLastLogin,

  // Storage functions
  uploadMemberFile: storageService.uploadMemberFile,
  deleteMemberFile: storageService.deleteMemberFile,
  getFileDownloadUrl: storageService.getFileDownloadUrl,

  // Stripe functions
  getStripeCustomerForMember: stripeService.getStripeCustomerForMember,
  getMemberSubscriptions: stripeService.getMemberSubscriptions,
  createPortalSession: stripeService.createPortalSession,
  createCheckoutSession: stripeService.createCheckoutSession,
  
  // Stripe sync functions
  verifySubscriptionStatus: stripeSyncService.verifySubscriptionStatus,
  verifyAndUpdateMemberSubscription: stripeSyncService.verifyAndUpdateMemberSubscription
};

export default supabaseService;


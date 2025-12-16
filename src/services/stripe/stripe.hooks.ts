import { useQuery } from '@tanstack/react-query';
import { verifySubscriptionStatus } from './stripe.sync';

/**
 * Hook to get and verify subscription status with intelligent caching
 * 
 * Features:
 * - Caches for 5 minutes (staleTime)
 * - Refetches when window regains focus
 * - Only runs when customerId is available
 */
export function useSubscriptionStatus(customerId?: string) {
  return useQuery({
    queryKey: ['subscription', customerId],
    queryFn: () => {
      if (!customerId) return null;
      return verifySubscriptionStatus(customerId);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in v5)
    refetchOnWindowFocus: true,
    enabled: !!customerId
  });
}

/**
 * Hook to get Stripe customer portal URL
 */
export function useStripePortal(customerId?: string) {
  return useQuery({
    queryKey: ['stripe-portal', customerId],
    queryFn: async () => {
      if (!customerId) return null;
      
      // This will be implemented in the portal service
      return null;
    },
    enabled: false // Only fetch when explicitly requested
  });
}


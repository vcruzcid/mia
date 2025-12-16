/**
 * Stripe Synchronization Service
 * 
 * This module provides critical functionality for maintaining accurate subscription
 * status between Stripe (source of truth) and our database.
 * 
 * Architecture: 3-Layer Hybrid System
 * 1. Webhooks: Immediate updates from Stripe events
 * 2. Login Verification: Direct API check on user login
 * 3. Cron Job: Periodic reconciliation every 6 hours
 */

import { supabase } from '../supabase.client';
import { getMemberByStripeId, updateMemberSubscriptionStatus } from '../members/member.service';

export interface SubscriptionStatus {
  status: string;
  subscription_id?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
}

export interface SubscriptionDiscrepancy {
  member_id: string;
  stripe_customer_id: string;
  db_status: string;
  stripe_status: string;
  detected_at: string;
}

/**
 * Verify subscription status directly with Stripe API
 * This is called during login and by the reconciliation cron job
 */
export async function verifySubscriptionStatus(customerId: string): Promise<SubscriptionStatus | null> {
  try {
    // Call our Cloudflare Function that verifies with Stripe API
    const { data, error } = await supabase.functions.invoke('verify-subscription', {
      body: { customerId }
    });

    if (error) {
      console.error('Error verifying subscription with Stripe:', error);
      return null;
    }

    const subscription = data?.subscription;
    if (!subscription) {
      return {
        status: 'inactive',
        subscription_id: undefined,
        current_period_end: undefined,
        cancel_at_period_end: false
      };
    }

    return {
      status: subscription.status,
      subscription_id: subscription.id,
      current_period_end: subscription.current_period_end 
        ? new Date(subscription.current_period_end * 1000).toISOString() 
        : undefined,
      cancel_at_period_end: subscription.cancel_at_period_end || false
    };
  } catch (error) {
    console.error('Error in verifySubscriptionStatus:', error);
    return null;
  }
}

/**
 * Verify and update member subscription status
 * Returns true if there was a discrepancy that was fixed
 */
export async function verifyAndUpdateMemberSubscription(customerId: string): Promise<boolean> {
  try {
    // 1. Get current member data from DB
    const member = await getMemberByStripeId(customerId);
    if (!member) {
      console.warn(`No member found for Stripe customer ${customerId}`);
      return false;
    }

    // 2. Verify with Stripe API
    const liveStatus = await verifySubscriptionStatus(customerId);
    if (!liveStatus) {
      console.error(`Failed to verify subscription for customer ${customerId}`);
      return false;
    }

    // 3. Check for discrepancy
    const hasDiscrepancy = member.stripe_subscription_status !== liveStatus.status;
    
    if (hasDiscrepancy) {
      console.warn(`Subscription discrepancy detected for member ${member.email}:`, {
        db_status: member.stripe_subscription_status,
        stripe_status: liveStatus.status
      });

      // Log the discrepancy
      await logDiscrepancy({
        member_id: member.id,
        stripe_customer_id: customerId,
        db_status: member.stripe_subscription_status || 'unknown',
        stripe_status: liveStatus.status,
        detected_at: new Date().toISOString()
      });

      // 4. Update DB with correct status from Stripe
      await updateMemberSubscriptionStatus(customerId, liveStatus);

      // 5. Update last_verified_at timestamp
      await supabase
        .from('members')
        .update({ last_verified_at: new Date().toISOString() })
        .eq('stripe_customer_id', customerId);

      return true; // Discrepancy was fixed
    }

    // No discrepancy, just update last_verified_at
    await supabase
      .from('members')
      .update({ last_verified_at: new Date().toISOString() })
      .eq('stripe_customer_id', customerId);

    return false; // No discrepancy
  } catch (error) {
    console.error('Error in verifyAndUpdateMemberSubscription:', error);
    return false;
  }
}

/**
 * Log a subscription discrepancy for auditing
 */
async function logDiscrepancy(discrepancy: SubscriptionDiscrepancy): Promise<void> {
  try {
    await supabase
      .from('subscription_discrepancies')
      .insert(discrepancy);
  } catch (error) {
    console.error('Error logging discrepancy:', error);
  }
}

/**
 * Get all members with Stripe customer IDs (for batch reconciliation)
 */
export async function getAllMembersWithStripeId(): Promise<Array<{ id: string; stripe_customer_id: string; email: string }>> {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('id, stripe_customer_id, email')
      .not('stripe_customer_id', 'is', null)
      .not('stripe_customer_id', 'eq', '');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching members with Stripe IDs:', error);
    return [];
  }
}

/**
 * Batch verify subscriptions (used by cron job)
 * Processes in chunks to avoid overwhelming the API
 */
export async function batchVerifySubscriptions(
  members: Array<{ id: string; stripe_customer_id: string; email: string }>,
  batchSize: number = 100
): Promise<{ total: number; fixed: number; errors: number }> {
  let fixed = 0;
  let errors = 0;

  // Process in batches
  for (let i = 0; i < members.length; i += batchSize) {
    const batch = members.slice(i, i + batchSize);
    
    const results = await Promise.allSettled(
      batch.map(member => verifyAndUpdateMemberSubscription(member.stripe_customer_id))
    );

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        if (result.value) fixed++; // Discrepancy was fixed
      } else {
        errors++;
        console.error(`Error verifying subscription for ${batch[index].email}:`, result.reason);
      }
    });

    // Small delay between batches to respect rate limits
    if (i + batchSize < members.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return {
    total: members.length,
    fixed,
    errors
  };
}


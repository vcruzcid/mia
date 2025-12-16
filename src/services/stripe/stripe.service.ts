import { supabase } from '../supabase.client';

// Get Stripe customer data for member
export async function getStripeCustomerForMember(email: string) {
  try {
    const { data, error } = await supabase
      .from('stripeschema.customers')
      .select('*')
      .eq('email', email)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching Stripe customer:', error);
    return null;
  }
}

// Get member's subscription data
export async function getMemberSubscriptions(stripeCustomerId: string) {
  try {
    const { data, error } = await supabase
      .from('stripeschema.subscriptions')
      .select('*')
      .eq('customer', stripeCustomerId)
      .order('created', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching member subscriptions:', error);
    return [];
  }
}

// Create Stripe Customer Portal session
export async function createPortalSession(customerId: string): Promise<{ url: string }> {
  const { data, error } = await supabase.functions.invoke('create-stripe-portal', {
    body: { customerId }
  });

  if (error) throw error;
  return data;
}

// Create Stripe Checkout session
export async function createCheckoutSession(priceId: string, memberEmail: string, customerId?: string): Promise<{ sessionId: string; url: string }> {
  const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
    body: { priceId, memberEmail, customerId }
  });

  if (error) throw error;
  return data;
}


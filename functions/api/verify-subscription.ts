/**
 * Cloudflare Function: Verify Subscription Status with Stripe API
 * 
 * This function provides direct verification of subscription status by querying
 * the Stripe API. It's used by:
 * 1. Login flow (AuthContext)
 * 2. Manual verification requests
 */

import Stripe from 'stripe';

interface Env {
  STRIPE_SECRET_KEY: string;
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { customerId } = await request.json();

    if (!customerId) {
      return new Response(
        JSON.stringify({ error: 'Customer ID is required' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20',
    });

    // Get active subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 1,
      expand: ['data.default_payment_method']
    });

    const subscription = subscriptions.data[0];

    if (!subscription) {
      return new Response(
        JSON.stringify({
          success: true,
          subscription: null,
          hasActiveSubscription: false
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        subscription: {
          id: subscription.id,
          status: subscription.status,
          current_period_start: subscription.current_period_start,
          current_period_end: subscription.current_period_end,
          cancel_at_period_end: subscription.cancel_at_period_end,
          canceled_at: subscription.canceled_at,
          trial_end: subscription.trial_end
        },
        hasActiveSubscription: subscription.status === 'active'
      }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('Error verifying subscription:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Error verifying subscription',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}


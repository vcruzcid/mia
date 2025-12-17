import { stripePostForm } from '../_lib/stripe';

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

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { customerId, returnUrl } = await request.json();

    if (!customerId) {
      return new Response(JSON.stringify({ error: 'Customer ID is required' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const origin = new URL(request.url).origin;

    const form = new URLSearchParams();
    form.set('customer', String(customerId));
    form.set('return_url', String(returnUrl || `${origin}/portal?tab=payment`));

    const session = await stripePostForm<{ url: string }>(
      { apiVersion: '2024-06-20', secretKey: env.STRIPE_SECRET_KEY },
      '/v1/billing_portal/sessions',
      form
    );

    return new Response(JSON.stringify({ url: session.url }), { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error('Error creating Stripe portal session:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'An error occurred creating portal session',
      }),
      { status: 400, headers: corsHeaders }
    );
  }
}
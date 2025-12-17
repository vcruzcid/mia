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
    const { priceId, memberEmail, customerId } = await request.json();

    if (!priceId || !memberEmail) {
      return new Response(
        JSON.stringify({ error: 'Price ID and member email are required' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const baseUrl = new URL(request.url).origin;

    const form = new URLSearchParams();
    form.set('payment_method_types[0]', 'card');
    form.set('line_items[0][price]', String(priceId));
    form.set('line_items[0][quantity]', '1');
    form.set('mode', 'subscription');
    form.set('success_url', `${baseUrl}/portal?session_id={CHECKOUT_SESSION_ID}&success=true`);
    form.set('cancel_url', `${baseUrl}/portal?tab=payment&cancelled=true`);
    form.set('metadata[member_email]', String(memberEmail));
    form.set('subscription_data[metadata][member_email]', String(memberEmail));

    if (customerId) {
      form.set('customer', String(customerId));
    } else {
      form.set('customer_email', String(memberEmail));
    }

    const session = await stripePostForm<{
      id: string;
      url: string | null;
    }>(
      { apiVersion: '2024-06-20', secretKey: env.STRIPE_SECRET_KEY },
      '/v1/checkout/sessions',
      form
    );

    return new Response(JSON.stringify({ sessionId: session.id, url: session.url }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'An error occurred creating checkout session',
      }),
      { status: 400, headers: corsHeaders }
    );
  }
}
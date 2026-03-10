// GET /api/checkout-session?session_id=cs_xxx
// Retrieves a Stripe Checkout Session and returns customer name and payment status.

import { log, warn, logError } from '../_lib/logger';

interface Env {
  STRIPE_SECRET_KEY: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

export function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;
  const sessionId = new URL(request.url).searchParams.get('session_id');

  if (!sessionId || !sessionId.startsWith('cs_')) {
    warn('stripe.session_lookup.invalid_id', { sessionId: sessionId ?? 'missing' });
    return new Response(
      JSON.stringify({ success: false, error: 'session_id inválido' }),
      { status: 400, headers: corsHeaders },
    );
  }

  const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
    headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` },
  });

  if (!res.ok) {
    const err = await res.json() as { error?: { message?: string } };
    logError('stripe.session_lookup.error', null, { sessionId, stripeError: err.error?.message });
    return new Response(
      JSON.stringify({ success: false, error: 'No se pudo recuperar la sesión' }),
      { status: 502, headers: corsHeaders },
    );
  }

  const session = await res.json() as {
    payment_status: string;
    customer_details?: { name?: string | null; email?: string | null };
  };

  log('stripe.session_lookup.success', { sessionId, payment_status: session.payment_status });

  return new Response(
    JSON.stringify({
      success: true,
      name: session.customer_details?.name ?? null,
      payment_status: session.payment_status,
    }),
    { status: 200, headers: corsHeaders },
  );
}

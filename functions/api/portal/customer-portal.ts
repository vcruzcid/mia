// POST /api/portal/customer-portal
// Looks up a Stripe customer by email and returns a Customer Portal session URL.
// The browser then redirects the member to manage their subscription.
//
// Protected by _middleware.ts — context.data.session is guaranteed to exist.

import { getCorsHeaders, getPreflightResponse } from '../../_lib/cors';
import { log, warn } from '../../_lib/logger';

interface Env {
  STRIPE_SECRET_KEY: string;
}

interface SessionData {
  email: string;
  contactId: string;
  nombre: string;
}

const METHODS = 'POST, OPTIONS';

export function onRequestOptions(context: { request: Request }): Response {
  return getPreflightResponse(context.request, METHODS);
}

export async function onRequestPost(
  context: { request: Request; env: Env; data: Record<string, unknown> },
): Promise<Response> {
  const cors = getCorsHeaders(context.request, METHODS);
  const session = context.data['session'] as SessionData | undefined;

  if (!session) {
    return new Response(
      JSON.stringify({ success: false, error: 'No autenticada' }),
      { status: 401, headers: cors },
    );
  }

  const email = session.email;

  // Find Stripe customer by email
  const searchRes = await fetch(
    `https://api.stripe.com/v1/customers?email=${encodeURIComponent(email)}&limit=1`,
    { headers: { Authorization: `Bearer ${context.env.STRIPE_SECRET_KEY}` } },
  );

  if (!searchRes.ok) {
    warn('stripe.customer_search_failed', { email, status: searchRes.status });
    return new Response(
      JSON.stringify({ success: false, error: 'Error al buscar el cliente' }),
      { status: 500, headers: cors },
    );
  }

  const searchData = await searchRes.json() as { data: Array<{ id: string }> };
  const customer = searchData.data?.[0];

  if (!customer) {
    return new Response(
      JSON.stringify({ success: false, error: 'No se encontró ninguna suscripción con este email' }),
      { status: 404, headers: cors },
    );
  }

  // Create portal session
  const origin = new URL(context.request.url).origin;
  const portalParams = new URLSearchParams({
    customer: customer.id,
    return_url: origin,
  });

  const portalRes = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${context.env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: portalParams.toString(),
  });

  if (!portalRes.ok) {
    let errMessage = 'Error creando el portal';
    try {
      const err = await portalRes.json() as { error?: { message?: string } };
      errMessage = err.error?.message ?? errMessage;
    } catch { /* non-json stripe error */ }
    warn('stripe.portal_session_error', { email, stripeError: errMessage });
    return new Response(
      JSON.stringify({ success: false, error: errMessage }),
      { status: 500, headers: cors },
    );
  }

  const portal = await portalRes.json() as { url: string };
  log('stripe.portal_session_created', { email, hasUrl: !!portal.url });
  return new Response(
    JSON.stringify({ success: true, url: portal.url }),
    { status: 200, headers: cors },
  );
}

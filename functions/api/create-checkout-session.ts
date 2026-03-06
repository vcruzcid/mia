// POST /api/create-checkout-session
// Creates a Stripe Checkout Session (subscription mode) and returns the redirect URL.

import { logError } from '../_lib/logger';

interface Env {
  STRIPE_SECRET_KEY: string;
  STRIPE_PRICE_PLENO_DERECHO: string;
  STRIPE_PRICE_ESTUDIANTE: string;
  STRIPE_PRICE_COLABORADOR: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

const PRICE_ID_MAP: Record<string, keyof Env> = {
  'pleno-derecho': 'STRIPE_PRICE_PLENO_DERECHO',
  'estudiante': 'STRIPE_PRICE_ESTUDIANTE',
  'colaborador': 'STRIPE_PRICE_COLABORADOR',
};

export function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  let membershipType: string;
  try {
    const body = await request.json() as { membershipType?: string };
    membershipType = body.membershipType ?? '';
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: 'Cuerpo de la solicitud inválido' }),
      { status: 400, headers: corsHeaders },
    );
  }

  const priceKey = PRICE_ID_MAP[membershipType];
  if (!priceKey) {
    return new Response(
      JSON.stringify({ success: false, error: 'Tipo de membresía no válido' }),
      { status: 400, headers: corsHeaders },
    );
  }

  const priceId = env[priceKey] as string;
  const origin = new URL(request.url).origin;

  const params = new URLSearchParams({
    mode: 'subscription',
    'line_items[0][price]': priceId,
    'line_items[0][quantity]': '1',
    success_url: `${origin}/registro/exito?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/registro`,
    'metadata[membership_type]': membershipType,
  });

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!res.ok) {
    const err = await res.json() as { error?: { message?: string } };
    logError('stripe.checkout_error', undefined, { membershipType, stripeError: err.error?.message });
    return new Response(
      JSON.stringify({ success: false, error: err.error?.message ?? 'Error creando sesión de pago' }),
      { status: 500, headers: corsHeaders },
    );
  }

  const session = await res.json() as { url: string };
  return new Response(
    JSON.stringify({ success: true, url: session.url }),
    { status: 200, headers: corsHeaders },
  );
}

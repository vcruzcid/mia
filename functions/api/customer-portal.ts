// POST /api/customer-portal
// Looks up a Stripe customer by email and returns a Customer Portal session URL.
// The browser then redirects the member to manage their subscription.

interface Env {
  STRIPE_SECRET_KEY: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

export function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  let email: string;
  try {
    const body = await request.json() as { email?: string };
    email = body.email?.trim().toLowerCase() ?? '';
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: 'Cuerpo de la solicitud inválido' }),
      { status: 400, headers: corsHeaders },
    );
  }

  if (!email) {
    return new Response(
      JSON.stringify({ success: false, error: 'El email es requerido' }),
      { status: 400, headers: corsHeaders },
    );
  }

  // Find Stripe customer by email
  const searchRes = await fetch(
    `https://api.stripe.com/v1/customers?email=${encodeURIComponent(email)}&limit=1`,
    { headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` } },
  );

  if (!searchRes.ok) {
    console.error('Stripe customer search failed:', searchRes.status);
    return new Response(
      JSON.stringify({ success: false, error: 'Error al buscar el cliente' }),
      { status: 500, headers: corsHeaders },
    );
  }

  const searchData = await searchRes.json() as { data: Array<{ id: string }> };
  const customer = searchData.data?.[0];

  if (!customer) {
    return new Response(
      JSON.stringify({ success: false, error: 'No se encontró ninguna suscripción con este email' }),
      { status: 404, headers: corsHeaders },
    );
  }

  // Create portal session
  const origin = new URL(request.url).origin;
  const portalParams = new URLSearchParams({
    customer: customer.id,
    return_url: origin,
  });

  const portalRes = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: portalParams.toString(),
  });

  if (!portalRes.ok) {
    const err = await portalRes.json() as { error?: { message?: string } };
    console.error('Stripe portal session error:', err);
    return new Response(
      JSON.stringify({ success: false, error: err.error?.message ?? 'Error creando el portal' }),
      { status: 500, headers: corsHeaders },
    );
  }

  const portal = await portalRes.json() as { url: string };
  return new Response(
    JSON.stringify({ success: true, url: portal.url }),
    { status: 200, headers: corsHeaders },
  );
}

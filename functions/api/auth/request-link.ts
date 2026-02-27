// POST /api/auth/request-link
// Body: { email: string }
// Checks WA for active membership, generates magic link token stored in KV.
// Returns the link directly in the JSON response (v1 — no email sending).

import { getContactByEmail, type WAContactsEnv } from '../../_lib/wa-contacts';

interface Env extends WAContactsEnv {
  KV: KVNamespace;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

export function onRequestOptions(): Response {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function onRequestPost(
  context: { request: Request; env: Env },
): Promise<Response> {
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

  if (!email || !email.includes('@')) {
    return new Response(
      JSON.stringify({ success: false, error: 'El email es requerido' }),
      { status: 400, headers: corsHeaders },
    );
  }

  let contact;
  try {
    contact = await getContactByEmail(env, email);
  } catch (err) {
    console.error('WA contact lookup failed:', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Error verificando membresía' }),
      { status: 500, headers: corsHeaders },
    );
  }

  if (!contact || !contact.MembershipEnabled || contact.Status !== 'Active') {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'No se encontró una membresía activa con este email',
      }),
      { status: 404, headers: corsHeaders },
    );
  }

  const token = crypto.randomUUID();
  const kvKey = `magic_link:${token}`;
  const kvValue = JSON.stringify({ email, contactId: String(contact.Id) });

  try {
    await env.KV.put(kvKey, kvValue, { expirationTtl: 900 }); // 15 minutes
  } catch (err) {
    console.error('KV put failed:', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Error interno del servidor' }),
      { status: 500, headers: corsHeaders },
    );
  }

  const origin = new URL(request.url).origin;
  const magicLink = `${origin}/api/auth/verify?token=${token}`;

  return new Response(
    JSON.stringify({ success: true, magicLink }),
    { status: 200, headers: corsHeaders },
  );
}

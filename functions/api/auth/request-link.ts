// POST /api/auth/request-link
// Body: { email: string, turnstileToken: string }
// Verifies Turnstile, checks WA for active membership, generates magic link token stored in KV.
// Returns the link directly in the JSON response (v1 — no email sending).
// TODO: replace with email delivery before go-live — returning the link in the response
// bypasses email ownership verification. Gate behind DEV_PORTAL env var before production.

import { getContactByEmail, type WAContactsEnv } from '../../_lib/wa-contacts';

interface Env extends WAContactsEnv {
  KV: KVNamespace;
  TURNSTILE_SECRET_KEY: string;
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

async function verifyTurnstile(token: string, secretKey: string, remoteip?: string): Promise<boolean> {
  const formData = new FormData();
  formData.append('secret', secretKey);
  formData.append('response', token);
  if (remoteip) formData.append('remoteip', remoteip);
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });
    const result = await res.json() as { success: boolean };
    return result.success;
  } catch {
    return false;
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function onRequestPost(
  context: { request: Request; env: Env },
): Promise<Response> {
  const { request, env } = context;

  let email: string;
  let turnstileToken: string;
  try {
    const body = await request.json() as { email?: string; turnstileToken?: string };
    email = body.email?.trim().toLowerCase() ?? '';
    turnstileToken = body.turnstileToken ?? '';
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: 'Cuerpo de la solicitud inválido' }),
      { status: 400, headers: corsHeaders },
    );
  }

  if (!email || !EMAIL_RE.test(email)) {
    return new Response(
      JSON.stringify({ success: false, error: 'El email es requerido' }),
      { status: 400, headers: corsHeaders },
    );
  }

  if (!turnstileToken) {
    return new Response(
      JSON.stringify({ success: false, error: 'Verificación de seguridad requerida' }),
      { status: 400, headers: corsHeaders },
    );
  }

  const clientIP = request.headers.get('CF-Connecting-IP') ?? request.headers.get('X-Forwarded-For') ?? undefined;
  const turnstileValid = await verifyTurnstile(turnstileToken, env.TURNSTILE_SECRET_KEY, clientIP);
  if (!turnstileValid) {
    return new Response(
      JSON.stringify({ success: false, error: 'Verificación de seguridad fallida. Por favor, inténtalo de nuevo.' }),
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

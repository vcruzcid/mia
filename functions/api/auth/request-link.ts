// POST /api/auth/request-link
// Body: { email: string, turnstileToken: string }
// Verifies Turnstile, checks WA for active membership, generates magic link token stored in KV.
//
// DEV_PORTAL env var: if set to any truthy string, returns the magic link in the response body
// for local development. In production (DEV_PORTAL unset), the link is NOT returned — email
// delivery must be implemented before go-live to preserve email ownership verification.

import { getContactByEmail, type WAContact, type WAContactsEnv } from '../../_lib/wa-contacts';
import { getCorsHeaders, getPreflightResponse } from '../../_lib/cors';

interface Env extends WAContactsEnv {
  KV: KVNamespace;
  TURNSTILE_SECRET_KEY: string;
  DEV_PORTAL?: string;
}

const METHODS = 'POST, OPTIONS';

export function onRequestOptions(context: { request: Request }): Response {
  return getPreflightResponse(context.request, METHODS);
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
  const cors = getCorsHeaders(request, METHODS);

  let email: string;
  let turnstileToken: string;
  try {
    const body = await request.json() as { email?: string; turnstileToken?: string };
    email = body.email?.trim().toLowerCase() ?? '';
    turnstileToken = body.turnstileToken ?? '';
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: 'Cuerpo de la solicitud inválido' }),
      { status: 400, headers: cors },
    );
  }

  if (!email || !EMAIL_RE.test(email)) {
    return new Response(
      JSON.stringify({ success: false, error: 'El email es requerido' }),
      { status: 400, headers: cors },
    );
  }

  if (!turnstileToken) {
    return new Response(
      JSON.stringify({ success: false, error: 'Verificación de seguridad requerida' }),
      { status: 400, headers: cors },
    );
  }

  const clientIP = request.headers.get('CF-Connecting-IP') ?? request.headers.get('X-Forwarded-For') ?? undefined;
  const turnstileValid = await verifyTurnstile(turnstileToken, env.TURNSTILE_SECRET_KEY, clientIP);
  if (!turnstileValid) {
    return new Response(
      JSON.stringify({ success: false, error: 'Verificación de seguridad fallida. Por favor, inténtalo de nuevo.' }),
      { status: 400, headers: cors },
    );
  }

  let contact: WAContact | null;
  try {
    contact = await getContactByEmail(env, email);
  } catch (err) {
    console.error('WA contact lookup failed:', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Error verificando membresía' }),
      { status: 500, headers: cors },
    );
  }

  if (!contact || !contact.MembershipEnabled || contact.Status !== 'Active') {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'No se encontró una membresía activa con este email',
      }),
      { status: 404, headers: cors },
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
      { status: 500, headers: cors },
    );
  }

  // In production (DEV_PORTAL unset), do not return the magic link — email delivery required.
  // Set DEV_PORTAL=true in .dev.vars to expose the link locally during development.
  if (!env.DEV_PORTAL) {
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: cors },
    );
  }

  const origin = new URL(request.url).origin;
  const magicLink = `${origin}/api/auth/verify?token=${token}`;

  return new Response(
    JSON.stringify({ success: true, magicLink }),
    { status: 200, headers: cors },
  );
}

// POST /api/auth/request-link
// Body: { email: string, turnstileToken: string }
// Verifies Turnstile, checks WA for active membership, generates magic link token stored in KV,
// and sends the link via Resend email.
//
// DEV_PORTAL env var: if set to any truthy string, also returns the magic link in the response body
// for local development. In production (DEV_PORTAL unset), the link is NOT returned — email is
// the only delivery mechanism.

import { getContactByEmail, type WAContact, type WAContactsEnv } from '../../_lib/wa-contacts';
import { getCorsHeaders, getPreflightResponse } from '../../_lib/cors';
import { sendMagicLinkEmail } from '../../_lib/email';
import { log, warn, logError } from '../../_lib/logger';

interface Env extends WAContactsEnv {
  KV: KVNamespace;
  TURNSTILE_SECRET_KEY: string;
  RESEND_API_KEY: string;
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
    logError('auth.error', err, { email, step: 'wa_lookup' });
    return new Response(
      JSON.stringify({ success: false, error: 'Error verificando membresía' }),
      { status: 500, headers: cors },
    );
  }

  if (!contact) {
    warn('auth.contact_not_found', { email });
    return new Response(
      JSON.stringify({
        success: false,
        error: 'No se encontró una membresía activa con este email',
      }),
      { status: 404, headers: cors },
    );
  }

  if (!contact.MembershipEnabled || contact.Status !== 'Active') {
    warn('auth.membership_inactive', { email, contactId: String(contact.Id), status: contact.Status });
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
    logError('auth.error', err, { email, step: 'kv_put' });
    return new Response(
      JSON.stringify({ success: false, error: 'Error interno del servidor' }),
      { status: 500, headers: cors },
    );
  }

  const origin = new URL(request.url).origin;
  const magicLink = `${origin}/api/auth/verify?token=${token}`;

  // Send magic link email (always, including DEV)
  try {
    await sendMagicLinkEmail(env.RESEND_API_KEY, email, magicLink);
  } catch (err) {
    logError('auth.error', err, { email, step: 'send_email' });
    return new Response(
      JSON.stringify({ success: false, error: 'Error enviando el enlace de acceso. Por favor, inténtalo de nuevo.' }),
      { status: 500, headers: cors },
    );
  }

  log('auth.magic_link_sent', { email, contactId: String(contact.Id) });

  // In DEV, also return the link in the response for easy testing
  if (env.DEV_PORTAL) {
    return new Response(
      JSON.stringify({ success: true, magicLink }),
      { status: 200, headers: cors },
    );
  }

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: cors },
  );
}

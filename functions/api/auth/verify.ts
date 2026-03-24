// POST /api/auth/verify
// Body: { token: string }
// Validates magic link token from KV, re-validates active membership,
// creates session, sets httpOnly cookie, returns JSON { success: true }.
// Frontend handles navigation to /portal/perfil.
//
// Token is delivered via URL hash (#token=) so email scanners never pre-fetch it.

import { getContact, type WAContact, type WAContactsEnv } from '../../_lib/wa-contacts';
import { getCorsHeaders, getPreflightResponse } from '../../_lib/cors';
import { log, warn, logError } from '../../_lib/logger';

interface Env extends WAContactsEnv {
  KV: KVNamespace;
}

const METHODS = 'POST, OPTIONS';
const SESSION_TTL = 7 * 24 * 60 * 60; // 604800 seconds (7 days)

export function onRequestOptions(context: { request: Request }): Response {
  return getPreflightResponse(context.request, METHODS);
}

export async function onRequestPost(
  context: { request: Request; env: Env },
): Promise<Response> {
  const { request, env } = context;
  const cors = getCorsHeaders(request, METHODS);

  let token: string;
  try {
    const body = await request.json() as { token?: string };
    token = body.token?.trim() ?? '';
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'invalid_request' }),
      { status: 400, headers: cors });
  }

  if (!token) {
    warn('auth.token_missing', { reason: 'empty_token' });
    return new Response(JSON.stringify({ success: false, error: 'token_missing' }),
      { status: 400, headers: cors });
  }

  const raw = await env.KV.get(`magic_link:${token}`);
  if (!raw) {
    warn('auth.token_invalid', { reason: 'token_not_found_in_kv' });
    return new Response(JSON.stringify({ success: false, error: 'token_invalid' }),
      { status: 401, headers: cors });
  }

  let magicData: { email: string; contactId: string };
  try {
    magicData = JSON.parse(raw) as { email: string; contactId: string };
  } catch (err) {
    logError('auth.error', err, { step: 'parse_kv' });
    return new Response(JSON.stringify({ success: false, error: 'token_invalid' }),
      { status: 401, headers: cors });
  }

  // Delete token (single-use) before any async work that could fail.
  await env.KV.delete(`magic_link:${token}`);

  let contact: WAContact;
  try {
    contact = await getContact(env, parseInt(magicData.contactId, 10));
  } catch (err) {
    logError('auth.error', err, { contactId: magicData.contactId, step: 'wa_lookup' });
    return new Response(JSON.stringify({ success: false, error: 'contact_not_found' }),
      { status: 401, headers: cors });
  }

  // Re-validate membership — it may have lapsed between request-link and verify.
  if (!contact.MembershipEnabled || contact.Status !== 'Active') {
    warn('auth.contact_inactive', { email: magicData.email, contactId: magicData.contactId, status: contact.Status });
    return new Response(JSON.stringify({ success: false, error: 'membership_inactive' }),
      { status: 401, headers: cors });
  }

  const sessionId = crypto.randomUUID();
  const sessionData = JSON.stringify({
    email: magicData.email,
    contactId: magicData.contactId,
    nombre: contact.DisplayName ?? `${contact.FirstName} ${contact.LastName}`.trim(),
  });

  await env.KV.put(`session:${sessionId}`, sessionData, { expirationTtl: SESSION_TTL });
  log('auth.session_created', { email: magicData.email, contactId: magicData.contactId });

  const isSecure = new URL(request.url).protocol === 'https:';
  const cookieValue =
    `mia_session=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL}` +
    (isSecure ? '; Secure' : '');

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...cors, 'Set-Cookie': cookieValue },
  });
}

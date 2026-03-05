// GET /api/auth/verify?token=xxx
// Browser redirect endpoint — NOT a JSON API. No CORS headers.
// Verifies magic link token from KV, re-validates active membership,
// creates session, sets httpOnly cookie, redirects to /portal/perfil.

import { getContact, type WAContact, type WAContactsEnv } from '../../_lib/wa-contacts';
import { log, warn, logError } from '../../_lib/logger';

interface Env extends WAContactsEnv {
  KV: KVNamespace;
}

const SESSION_TTL = 7 * 24 * 60 * 60; // 604800 seconds (7 days)

export async function onRequestGet(
  context: { request: Request; env: Env },
): Promise<Response> {
  const { request, env } = context;
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    warn('auth.token_missing');
    return Response.redirect(`${url.origin}/portal/login?error=token_missing`, 302);
  }

  const raw = await env.KV.get(`magic_link:${token}`);
  if (!raw) {
    warn('auth.token_invalid');
    return Response.redirect(`${url.origin}/portal/login?error=token_invalid`, 302);
  }

  let magicData: { email: string; contactId: string };
  try {
    magicData = JSON.parse(raw) as { email: string; contactId: string };
  } catch (err) {
    logError('auth.error', err, { step: 'parse_kv' });
    return Response.redirect(`${url.origin}/portal/login?error=token_invalid`, 302);
  }

  // Delete token (single-use) before any async work that could fail.
  await env.KV.delete(`magic_link:${token}`);

  let contact: WAContact;
  try {
    contact = await getContact(env, parseInt(magicData.contactId, 10));
  } catch (err) {
    logError('auth.error', err, { contactId: magicData.contactId, step: 'wa_lookup' });
    return Response.redirect(`${url.origin}/portal/login?error=contact_not_found`, 302);
  }

  // Re-validate membership — it may have lapsed between request-link and verify.
  if (!contact.MembershipEnabled || contact.Status !== 'Active') {
    warn('auth.contact_inactive', { email: magicData.email, contactId: magicData.contactId, status: contact.Status });
    return Response.redirect(`${url.origin}/portal/login?error=membership_inactive`, 302);
  }

  const sessionId = crypto.randomUUID();
  const sessionData = JSON.stringify({
    email: magicData.email,
    contactId: magicData.contactId,
    nombre: contact.DisplayName ?? `${contact.FirstName} ${contact.LastName}`.trim(),
  });

  await env.KV.put(`session:${sessionId}`, sessionData, { expirationTtl: SESSION_TTL });
  log('auth.session_created', { email: magicData.email, contactId: magicData.contactId });

  const isSecure = url.protocol === 'https:';
  const cookieValue =
    `mia_session=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL}` +
    (isSecure ? '; Secure' : '');

  return new Response(null, {
    status: 302,
    headers: {
      Location: `${url.origin}/portal/perfil`,
      'Set-Cookie': cookieValue,
    },
  });
}

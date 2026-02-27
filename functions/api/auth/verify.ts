// GET /api/auth/verify?token=xxx
// Browser redirect endpoint — NOT a JSON API. No CORS headers.
// Verifies magic link token from KV, creates session, sets httpOnly cookie,
// redirects to /portal/perfil.

import { getContact, type WAContactsEnv } from '../../_lib/wa-contacts';

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
    return Response.redirect(`${url.origin}/portal/login?error=token_missing`, 302);
  }

  const raw = await env.KV.get(`magic_link:${token}`);
  if (!raw) {
    return Response.redirect(`${url.origin}/portal/login?error=token_invalid`, 302);
  }

  let magicData: { email: string; contactId: string };
  try {
    magicData = JSON.parse(raw) as { email: string; contactId: string };
  } catch {
    return Response.redirect(`${url.origin}/portal/login?error=token_invalid`, 302);
  }

  // Delete token (single-use)
  await env.KV.delete(`magic_link:${token}`);

  let contact;
  try {
    contact = await getContact(env, parseInt(magicData.contactId, 10));
  } catch {
    return Response.redirect(`${url.origin}/portal/login?error=contact_not_found`, 302);
  }

  const sessionId = crypto.randomUUID();
  const sessionData = JSON.stringify({
    email: magicData.email,
    contactId: magicData.contactId,
    nombre: contact.DisplayName ?? `${contact.FirstName} ${contact.LastName}`.trim(),
  });

  await env.KV.put(`session:${sessionId}`, sessionData, { expirationTtl: SESSION_TTL });

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

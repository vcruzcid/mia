// POST /api/auth/logout
// Deletes session from KV and clears cookie.

import { getSessionId } from '../../_lib/session';
import { getCorsHeaders, getPreflightResponse } from '../../_lib/cors';

interface Env {
  KV: KVNamespace;
}

const METHODS = 'POST, OPTIONS';

export function onRequestOptions(context: { request: Request }): Response {
  return getPreflightResponse(context.request, METHODS);
}

export async function onRequestPost(
  context: { request: Request; env: Env },
): Promise<Response> {
  const { request, env } = context;
  const cors = getCorsHeaders(request, METHODS);

  const sessionId = getSessionId(request);
  if (sessionId) {
    await env.KV.delete(`session:${sessionId}`);
  }

  const isSecure = new URL(request.url).protocol === 'https:';
  const clearCookie =
    'mia_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0' +
    (isSecure ? '; Secure' : '');

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: { ...cors, 'Set-Cookie': clearCookie } },
  );
}

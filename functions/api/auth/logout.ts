// POST /api/auth/logout
// Deletes session from KV and clears cookie.

import { getSessionId } from '../../_lib/session';

interface Env {
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
    {
      status: 200,
      headers: { ...corsHeaders, 'Set-Cookie': clearCookie },
    },
  );
}

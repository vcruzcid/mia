// GET /api/auth/me
// Returns session member data from KV. Used by frontend to check auth state.

import { getSessionId } from '../../_lib/session';

interface Env {
  KV: KVNamespace;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

export function onRequestOptions(): Response {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function onRequestGet(
  context: { request: Request; env: Env },
): Promise<Response> {
  const { request, env } = context;

  const sessionId = getSessionId(request);
  if (!sessionId) {
    return new Response(
      JSON.stringify({ success: false, error: 'No autenticada' }),
      { status: 401, headers: corsHeaders },
    );
  }

  const raw = await env.KV.get(`session:${sessionId}`);
  if (!raw) {
    return new Response(
      JSON.stringify({ success: false, error: 'Sesión expirada' }),
      { status: 401, headers: corsHeaders },
    );
  }

  let session: { email: string; contactId: string; nombre: string };
  try {
    session = JSON.parse(raw) as { email: string; contactId: string; nombre: string };
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: 'Sesión inválida' }),
      { status: 401, headers: corsHeaders },
    );
  }

  return new Response(
    JSON.stringify({ success: true, member: session }),
    { status: 200, headers: corsHeaders },
  );
}

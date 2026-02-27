// GET /api/auth/me
// Returns session member data from KV. Used by frontend to check auth state.

import { getSessionId } from '../../_lib/session';
import { getCorsHeaders, getPreflightResponse } from '../../_lib/cors';

interface Env {
  KV: KVNamespace;
}

const METHODS = 'GET, OPTIONS';

export function onRequestOptions(context: { request: Request }): Response {
  return getPreflightResponse(context.request, METHODS);
}

export async function onRequestGet(
  context: { request: Request; env: Env },
): Promise<Response> {
  const { request, env } = context;
  const cors = getCorsHeaders(request, METHODS);

  const sessionId = getSessionId(request);
  if (!sessionId) {
    return new Response(
      JSON.stringify({ success: false, error: 'No autenticada' }),
      { status: 401, headers: cors },
    );
  }

  const raw = await env.KV.get(`session:${sessionId}`);
  if (!raw) {
    return new Response(
      JSON.stringify({ success: false, error: 'Sesión expirada' }),
      { status: 401, headers: cors },
    );
  }

  let session: { email: string; contactId: string; nombre: string };
  try {
    session = JSON.parse(raw) as { email: string; contactId: string; nombre: string };
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: 'Sesión inválida' }),
      { status: 401, headers: cors },
    );
  }

  return new Response(
    JSON.stringify({ success: true, member: session }),
    { status: 200, headers: cors },
  );
}

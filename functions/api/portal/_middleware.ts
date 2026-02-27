// Middleware for all /api/portal/* routes.
// Validates mia_session cookie against KV. Returns 401 if invalid.
// Attaches session data to context.data for downstream handlers.

import { getSessionId } from '../../../_lib/session';
import { getCorsHeaders, getPreflightResponse } from '../../../_lib/cors';

interface Env {
  KV: KVNamespace;
}

interface SessionData {
  email: string;
  contactId: string;
  nombre: string;
}

interface PortalContext {
  request: Request;
  env: Env;
  next: () => Promise<Response>;
  data: Record<string, unknown>;
}

const METHODS = 'GET, POST, PUT, OPTIONS';

export async function onRequest(context: PortalContext): Promise<Response> {
  if (context.request.method === 'OPTIONS') {
    return getPreflightResponse(context.request, METHODS);
  }

  const cors = getCorsHeaders(context.request, METHODS);
  const sessionId = getSessionId(context.request);

  if (!sessionId) {
    return new Response(
      JSON.stringify({ success: false, error: 'No autenticada' }),
      { status: 401, headers: cors },
    );
  }

  const raw = await context.env.KV.get(`session:${sessionId}`);
  if (!raw) {
    return new Response(
      JSON.stringify({ success: false, error: 'Sesión expirada' }),
      { status: 401, headers: cors },
    );
  }

  context.data['session'] = JSON.parse(raw) as SessionData;
  return context.next();
}

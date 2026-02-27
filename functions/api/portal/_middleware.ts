// Middleware for all /api/portal/* routes.
// Validates mia_session cookie against KV. Returns 401 if invalid.
// Attaches session data to context.data for downstream handlers.

import { getSessionId } from '../../../_lib/session';

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

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

export async function onRequest(context: PortalContext): Promise<Response> {
  // Pass OPTIONS preflight through — downstream handlers add their own CORS.
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const sessionId = getSessionId(context.request);

  if (!sessionId) {
    return new Response(
      JSON.stringify({ success: false, error: 'No autenticada' }),
      { status: 401, headers: corsHeaders },
    );
  }

  const raw = await context.env.KV.get(`session:${sessionId}`);
  if (!raw) {
    return new Response(
      JSON.stringify({ success: false, error: 'Sesión expirada' }),
      { status: 401, headers: corsHeaders },
    );
  }

  context.data['session'] = JSON.parse(raw) as SessionData;
  return context.next();
}

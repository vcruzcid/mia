// Middleware for all /api/portal/* routes.
// Validates mia_session cookie against KV. Returns 401 if invalid.
// Attaches session data to context.data for downstream handlers.

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

function getSessionId(request: Request): string | null {
  const cookieHeader = request.headers.get('Cookie') ?? '';
  const match = cookieHeader.match(/mia_session=([^;]+)/);
  return match?.[1] ?? null;
}

export async function onRequest(context: PortalContext): Promise<Response> {
  const sessionId = getSessionId(context.request);

  if (!sessionId) {
    return new Response(
      JSON.stringify({ success: false, error: 'No autenticada' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const raw = await context.env.KV.get(`session:${sessionId}`);
  if (!raw) {
    return new Response(
      JSON.stringify({ success: false, error: 'Sesión expirada' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    );
  }

  context.data['session'] = JSON.parse(raw) as SessionData;
  return context.next();
}

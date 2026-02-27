// GET /api/auth/me
// Returns session member data from KV. Used by frontend to check auth state.

interface Env {
  KV: KVNamespace;
}

function getSessionId(request: Request): string | null {
  const cookieHeader = request.headers.get('Cookie') ?? '';
  const match = cookieHeader.match(/mia_session=([^;]+)/);
  return match?.[1] ?? null;
}

export async function onRequestGet(
  context: { request: Request; env: Env },
): Promise<Response> {
  const { request, env } = context;

  const sessionId = getSessionId(request);
  if (!sessionId) {
    return new Response(
      JSON.stringify({ success: false, error: 'No autenticada' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const raw = await env.KV.get(`session:${sessionId}`);
  if (!raw) {
    return new Response(
      JSON.stringify({ success: false, error: 'Sesión expirada' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const session = JSON.parse(raw) as { email: string; contactId: string; nombre: string };

  return new Response(
    JSON.stringify({ success: true, member: session }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
}

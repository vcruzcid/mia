// POST /api/auth/logout
// Deletes session from KV and clears cookie.

interface Env {
  KV: KVNamespace;
}

function getSessionId(request: Request): string | null {
  const cookieHeader = request.headers.get('Cookie') ?? '';
  const match = cookieHeader.match(/mia_session=([^;]+)/);
  return match?.[1] ?? null;
}

export async function onRequestPost(
  context: { request: Request; env: Env },
): Promise<Response> {
  const { request, env } = context;

  const sessionId = getSessionId(request);
  if (sessionId) {
    await env.KV.delete(`session:${sessionId}`);
  }

  const clearCookie = 'mia_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0';

  return new Response(
    JSON.stringify({ success: true }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': clearCookie,
      },
    },
  );
}

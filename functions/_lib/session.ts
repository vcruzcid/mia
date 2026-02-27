// Shared cookie session helper used by auth and portal middleware.

export function getSessionId(request: Request): string | null {
  const cookieHeader = request.headers.get('Cookie') ?? '';
  const match = cookieHeader.match(/mia_session=([^;]+)/);
  return match?.[1] ?? null;
}

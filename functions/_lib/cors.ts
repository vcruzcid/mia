// Shared CORS helpers for all auth and portal API endpoints.
//
// IMPORTANT: Access-Control-Allow-Origin must NOT be '*' when requests include
// credentials (cookies). We reflect the validated request origin instead.

const ALLOWED_ORIGINS = [
  'https://animacionesmia.com',
  'https://dev.animacionesmia.com',
  // Local dev: Vite (3000) and wrangler dev (8788)
  'http://localhost:3000',
  'http://localhost:8788',
];

function getAllowedOrigin(request: Request): string {
  const origin = request.headers.get('Origin') ?? '';
  return ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
}

/** Headers for JSON API responses that require cookie credentials. */
export function getCorsHeaders(
  request: Request,
  methods: string,
): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': getAllowedOrigin(request),
    'Access-Control-Allow-Methods': methods,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json',
  };
}

/** Headers for OPTIONS preflight — no Content-Type (no body). */
export function getPreflightResponse(request: Request, methods: string): Response {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': getAllowedOrigin(request),
      'Access-Control-Allow-Methods': methods,
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}

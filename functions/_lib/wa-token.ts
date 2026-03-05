// WildApricot OAuth token helper — fetches and caches token in KV

import { log, logError } from './logger';

interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

export interface WATokenEnv {
  KV: KVNamespace;
  WILDAPRICOT_API_KEY: string;
}

const KV_KEY = 'wa_token';
const TOKEN_TTL_SECONDS = 1740; // 29 min — WA token expires in 30 min

export async function getWAToken(env: WATokenEnv, requestId?: string): Promise<string> {
  const cached = await env.KV.get(KV_KEY);
  if (cached) {
    log('wa.token_cache_hit', { requestId });
    return cached;
  }

  const credentials = btoa(`APIKEY:${env.WILDAPRICOT_API_KEY}`);
  const t0 = Date.now();
  const res = await fetch('https://oauth.wildapricot.org/auth/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials&scope=auto',
  });

  if (!res.ok) {
    logError('wa.token_error', undefined, { status: res.status, requestId });
    throw new Error(`WildApricot auth failed: ${res.status} ${res.statusText}`);
  }

  const { access_token } = await res.json() as { access_token: string };
  await env.KV.put(KV_KEY, access_token, { expirationTtl: TOKEN_TTL_SECONDS });
  log('wa.token_fetch', { durationMs: Date.now() - t0, requestId });

  return access_token;
}

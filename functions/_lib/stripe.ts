type StripeFetchOptions = {
  apiVersion: string;
  secretKey: string;
};

export async function stripeGet<T>(
  opts: StripeFetchOptions,
  path: string,
  query?: Record<string, string | string[] | number | boolean | null | undefined>
): Promise<T> {
  const url = new URL(`https://api.stripe.com${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === null || v === undefined) continue;
      if (Array.isArray(v)) {
        for (const item of v) url.searchParams.append(k, String(item));
      } else {
        url.searchParams.set(k, String(v));
      }
    }
  }
  return stripeFetch<T>(opts, url.toString(), { method: 'GET' });
}

export async function stripePostForm<T>(
  opts: StripeFetchOptions,
  path: string,
  form: URLSearchParams
): Promise<T> {
  return stripeFetch<T>(opts, `https://api.stripe.com${path}`, {
    method: 'POST',
    body: form.toString(),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
}

async function stripeFetch<T>(
  opts: StripeFetchOptions,
  url: string,
  init: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${opts.secretKey}`,
      'Stripe-Version': opts.apiVersion,
      ...(init.headers ?? {}),
    },
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // ignore parse error; keep raw text for error reporting
  }

  if (!res.ok) {
    const msg =
      json?.error?.message ||
      json?.message ||
      (typeof text === 'string' && text.length ? text : `Stripe request failed (${res.status})`);
    throw new Error(msg);
  }

  return json as T;
}

/**
 * Verify Stripe webhook signature using WebCrypto (Workers-compatible).
 * Stripe docs: signed_payload = `${timestamp}.${payload}`
 */
export async function verifyStripeWebhookSignature(params: {
  payload: string;
  signatureHeader: string | null;
  webhookSecret: string;
}): Promise<{ timestamp: string; signature: string } | null> {
  const { payload, signatureHeader, webhookSecret } = params;
  if (!signatureHeader) return null;

  const parts = signatureHeader.split(',').map(s => s.trim());
  const t = parts.find(p => p.startsWith('t='))?.slice(2);
  const v1s = parts.filter(p => p.startsWith('v1=')).map(p => p.slice(3));
  if (!t || v1s.length === 0) return null;

  const signedPayload = `${t}.${payload}`;
  const expected = await hmacSha256Hex(webhookSecret, signedPayload);

  // Constant-time compare across provided signatures
  for (const v1 of v1s) {
    if (timingSafeEqualHex(v1, expected)) {
      return { timestamp: t, signature: v1 };
    }
  }
  return null;
}

async function hmacSha256Hex(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return bytesToHex(new Uint8Array(sig));
}

function bytesToHex(bytes: Uint8Array): string {
  let out = '';
  for (const b of bytes) out += b.toString(16).padStart(2, '0');
  return out;
}

function hexToBytes(hex: string): Uint8Array | null {
  const clean = hex.trim().toLowerCase();
  if (!/^[0-9a-f]+$/.test(clean) || clean.length % 2 !== 0) return null;
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  return out;
}

function timingSafeEqualHex(a: string, b: string): boolean {
  const ba = hexToBytes(a);
  const bb = hexToBytes(b);
  if (!ba || !bb || ba.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ba.length; i++) diff |= ba[i] ^ bb[i];
  return diff === 0;
}



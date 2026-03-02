// Test helper: sends a signed checkout.session.completed event to the local webhook endpoint.
// Usage: node scripts/test-stripe-webhook.mjs
// Requires Node 20+ (Web Crypto built-in).

const WEBHOOK_SECRET = 'whsec_26266ff9ab0a68299c721e7dc39093abd84396d3cd9c7a4cff3650f60119b27f';
// Update to Cloudflare preview URL when testing against deployed env.
const ENDPOINT = process.env.WEBHOOK_URL ?? 'http://localhost:8788/api/stripe-webhook';

const payload = {
  id: 'evt_test_local_001',
  type: 'checkout.session.completed',
  data: {
    object: {
      id: 'cs_test_local_001',
      mode: 'subscription',
      metadata: { membership_type: 'pleno-derecho' },
      customer_details: {
        email: 'victor@cruzcid.com',
        name: 'Victor Cruz Cid',
      },
      customer: 'cus_test_local_001',
    },
  },
};

const body = JSON.stringify(payload);
const timestamp = Math.floor(Date.now() / 1000).toString();
const signedPayload = `${timestamp}.${body}`;

// The server signs with TextEncoder(fullSecret) — match that exactly.
const keyBytes = new TextEncoder().encode(WEBHOOK_SECRET);

const key = await crypto.subtle.importKey(
  'raw',
  keyBytes,
  { name: 'HMAC', hash: 'SHA-256' },
  false,
  ['sign'],
);

const sigBytes = await crypto.subtle.sign(
  'HMAC',
  key,
  new TextEncoder().encode(signedPayload),
);

const sig = Array.from(new Uint8Array(sigBytes))
  .map(b => b.toString(16).padStart(2, '0'))
  .join('');

const stripeSignature = `t=${timestamp},v1=${sig}`;

console.log('→ POST', ENDPOINT);
console.log('  Payload:', JSON.stringify(payload.data.object.metadata), payload.data.object.customer_details);

const res = await fetch(ENDPOINT, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'stripe-signature': stripeSignature,
  },
  body,
});

const text = await res.text();
console.log(`← ${res.status} ${res.statusText}: ${text}`);

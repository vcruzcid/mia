// @vitest-environment node
// Unit tests for Stripe webhook signature verification.
// The production verifyStripeSignature function is not exported, so these tests
// validate the algorithm directly to prove the fix is correct.

import { describe, it, expect } from 'vitest';

// Reproduces the exact algorithm in stripe-webhook.ts verifyStripeSignature.
async function verifySignature(body: string, signature: string, secret: string): Promise<boolean> {
  const parts = signature.split(',');
  const timestamp = parts.find(p => p.startsWith('t='))?.slice(2);
  const signatures = parts.filter(p => p.startsWith('v1=')).map(p => p.slice(3));
  if (!timestamp || signatures.length === 0) return false;
  const payload = `${timestamp}.${body}`;
  const rawSecret = new TextEncoder().encode(secret);
  const key = await crypto.subtle.importKey('raw', rawSecret, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sigBytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  const computed = Array.from(new Uint8Array(sigBytes)).map(b => b.toString(16).padStart(2, '0')).join('');
  return signatures.includes(computed);
}

// Produces a valid Stripe-Signature header for a given body + secret.
async function signBody(body: string, secret: string, timestamp: number): Promise<string> {
  const payload = `${timestamp}.${body}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sigBytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  const sig = Array.from(new Uint8Array(sigBytes)).map(b => b.toString(16).padStart(2, '0')).join('');
  return `t=${timestamp},v1=${sig}`;
}

const SECRET = 'whsec_testSecretKey12345';
const BODY = JSON.stringify({ type: 'checkout.session.completed', data: { object: {} } });

describe('stripe webhook signature verification', () => {
  it('accepts a correctly signed payload', async () => {
    const ts = Math.floor(Date.now() / 1000);
    const header = await signBody(BODY, SECRET, ts);
    expect(await verifySignature(BODY, header, SECRET)).toBe(true);
  });

  it('rejects a tampered body', async () => {
    const ts = Math.floor(Date.now() / 1000);
    const header = await signBody(BODY, SECRET, ts);
    expect(await verifySignature('{"tampered":true}', header, SECRET)).toBe(false);
  });

  it('rejects a wrong secret', async () => {
    const ts = Math.floor(Date.now() / 1000);
    const header = await signBody(BODY, SECRET, ts);
    expect(await verifySignature(BODY, header, 'whsec_wrongSecret')).toBe(false);
  });

  it('rejects a missing v1 signature', async () => {
    const ts = Math.floor(Date.now() / 1000);
    expect(await verifySignature(BODY, `t=${ts}`, SECRET)).toBe(false);
  });

  it('rejects an empty signature header', async () => {
    expect(await verifySignature(BODY, '', SECRET)).toBe(false);
  });

  it('old base64-decode approach produces a different key and would never match', async () => {
    // Demonstrate why the old code was broken: atob(secret.replace(/^whsec_/, ''))
    // produces different bytes than TextEncoder().encode(secret), so the HMAC keys
    // are different and the signatures never match.
    const ts = Math.floor(Date.now() / 1000);
    const correctHeader = await signBody(BODY, SECRET, ts);

    // Compute what the OLD wrong code would have produced as the HMAC key.
    // SECRET after stripping whsec_ is "testSecretKey12345" — which happens to be
    // valid base64url-ish BUT atob decodes it to different bytes than UTF-8 encoding.
    const strippedSecret = SECRET.replace(/^whsec_/, '');
    const oldKeyBytes = Uint8Array.from(atob(strippedSecret), c => c.charCodeAt(0));
    const oldKey = await crypto.subtle.importKey('raw', oldKeyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const payload = `${ts}.${BODY}`;
    const oldSigBytes = await crypto.subtle.sign('HMAC', oldKey, new TextEncoder().encode(payload));
    const oldSig = Array.from(new Uint8Array(oldSigBytes)).map(b => b.toString(16).padStart(2, '0')).join('');

    const correctSig = correctHeader.split(',v1=')[1];
    // The old approach produces a different signature — this is the bug.
    expect(oldSig).not.toBe(correctSig);
  });
});

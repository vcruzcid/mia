// POST /api/stripe-webhook
// Handles Stripe webhook events for subscription lifecycle management.
// Events handled:
//   - checkout.session.completed  → create/update WildApricot contact
//   - customer.subscription.deleted → lapse WildApricot membership

import { createOrUpdateContact, lapseMembership, splitName, type WAContactsEnv } from '../_lib/wa-contacts';

interface Env extends WAContactsEnv {
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
}

// Verify Stripe webhook signature using Web Crypto API
async function verifyStripeSignature(body: string, signature: string, secret: string): Promise<boolean> {
  const parts = signature.split(',');
  const timestamp = parts.find(p => p.startsWith('t='))?.slice(2);
  const signatures = parts.filter(p => p.startsWith('v1=')).map(p => p.slice(3));

  if (!timestamp || signatures.length === 0) return false;

  // Reject events older than 5 minutes
  if (Math.abs(Date.now() / 1000 - parseInt(timestamp, 10)) > 300) return false;

  const payload = `${timestamp}.${body}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sigBytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  const computed = Array.from(new Uint8Array(sigBytes))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return signatures.includes(computed);
}

// Fetch customer email from Stripe when we only have a customer ID
async function getStripeCustomerEmail(customerId: string, secretKey: string): Promise<string | null> {
  const res = await fetch(`https://api.stripe.com/v1/customers/${customerId}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  if (!res.ok) return null;
  const customer = await res.json() as { email?: string };
  return customer.email ?? null;
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  // Must read raw body before parsing to verify signature
  const rawBody = await request.text();
  const signature = request.headers.get('stripe-signature') ?? '';

  const valid = await verifyStripeSignature(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
  if (!valid) {
    console.error('Stripe webhook signature verification failed');
    return new Response('Firma inválida', { status: 400 });
  }

  let event: { type: string; data: { object: Record<string, unknown> } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response('Payload inválido', { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as {
        metadata?: { membership_type?: string };
        customer_details?: { name?: string; email?: string };
        customer?: string;
        mode?: string;
      };

      // Only handle subscription checkouts
      if (session.mode !== 'subscription') {
        return new Response('OK', { status: 200 });
      }

      const membershipType = session.metadata?.membership_type;
      const email = session.customer_details?.email;
      const fullName = session.customer_details?.name ?? '';

      if (!membershipType || !email) {
        console.error('checkout.session.completed missing required fields', { membershipType, email });
        return new Response('Datos incompletos', { status: 400 });
      }

      const { firstName, lastName } = splitName(fullName);

      await createOrUpdateContact(env, { email, firstName, lastName, membershipType });
      console.log(`WA contact created/updated for ${email} (${membershipType})`);
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as { customer?: string };
      const customerId = subscription.customer;

      if (!customerId) {
        console.error('customer.subscription.deleted missing customer ID');
        return new Response('Datos incompletos', { status: 400 });
      }

      const email = await getStripeCustomerEmail(customerId, env.STRIPE_SECRET_KEY);
      if (!email) {
        console.error(`Could not fetch email for Stripe customer ${customerId}`);
        return new Response('Cliente no encontrado', { status: 400 });
      }

      await lapseMembership(env, email);
      console.log(`WA membership lapsed for ${email}`);
    }
  } catch (err) {
    console.error(`Error handling ${event.type}:`, err);
    // Return 500 so Stripe retries the event
    return new Response('Error interno', { status: 500 });
  }

  return new Response('OK', { status: 200 });
}

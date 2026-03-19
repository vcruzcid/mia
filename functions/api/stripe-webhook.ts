// POST /api/stripe-webhook
// Handles Stripe webhook events for subscription lifecycle management.
// Events handled:
//   - checkout.session.completed  → create/update WildApricot contact
//   - customer.subscription.deleted → lapse WildApricot membership

import { createOrUpdateContact, getContactByEmail, lapseMembership, splitName } from '../_lib/wa-contacts';
import { log, logError } from '../_lib/logger';
import { sendWelcomeMemberEmail } from '../_lib/email';
import {
  attachMemberCodeAssignment,
  ensureMemberCode,
  getOrReserveMemberCodeForEmail,
  type MemberCodeEnv,
} from '../_lib/member-code';

interface Env extends MemberCodeEnv {
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  RESEND_API_KEY: string;
  WA_WHATSAPP_GROUP_URL: string;
}

// Verify Stripe webhook signature using Web Crypto API
export async function verifyStripeSignature(body: string, signature: string, secret: string): Promise<boolean> {
  const parts = signature.split(',');
  const timestamp = parts.find(p => p.startsWith('t='))?.slice(2);
  const signatures = parts.filter(p => p.startsWith('v1=')).map(p => p.slice(3));

  if (!timestamp || signatures.length === 0) return false;

  // Reject events older than 5 minutes
  if (Math.abs(Date.now() / 1000 - parseInt(timestamp, 10)) > 300) return false;

  const payload = `${timestamp}.${body}`;
  const rawSecret = new TextEncoder().encode(secret);
  const key = await crypto.subtle.importKey(
    'raw',
    rawSecret,
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

export async function onRequestPost(context: {
  request: Request;
  env: Env;
  waitUntil: (promise: Promise<unknown>) => void;
}): Promise<Response> {
  const { request, env } = context;
  const requestId = crypto.randomUUID();

  // Must read raw body before parsing to verify signature
  const rawBody = await request.text();
  const signature = request.headers.get('stripe-signature') ?? '';

  const valid = await verifyStripeSignature(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
  if (!valid) {
    logError('webhook.signature_invalid', undefined, { requestId });
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
        customer_details?: { name?: string; email?: string; address?: { country?: string } };
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
      const country = session.customer_details?.address?.country ?? undefined;

      if (!membershipType || !email) {
        logError('webhook.checkout_completed', undefined, { membershipType, email: email ?? null, reason: 'missing_fields', requestId });
        return new Response('Datos incompletos', { status: 400 });
      }

      const { firstName, lastName } = splitName(fullName);
      const existingContact = await getContactByEmail(env, email);
      const preassignedMemberCode = existingContact
        ? ''
        : await getOrReserveMemberCodeForEmail(env, email);

      const { contactId, renewalDate, memberCode: waMemberCode } = await createOrUpdateContact(
        env,
        {
          email,
          firstName,
          lastName,
          membershipType,
          country,
          memberCode: preassignedMemberCode || undefined,
          existingContactId: existingContact?.Id,
        },
        requestId,
      );
      const memberCode = existingContact
        ? (waMemberCode || await ensureMemberCode(env, contactId, email))
        : await attachMemberCodeAssignment(env, email, contactId, preassignedMemberCode);

      log('webhook.checkout_completed', { email, membershipType, contactId, requestId });

      // Best-effort welcome email — use waitUntil so the runtime keeps the worker alive
      // until the Resend fetch completes (fire-and-forget without waitUntil is killed on response)
      context.waitUntil(
        sendWelcomeMemberEmail(env.RESEND_API_KEY, email, firstName, membershipType, memberCode, renewalDate, env.WA_WHATSAPP_GROUP_URL)
          .catch(err => logError('webhook.welcome_email_failed', err, { email, membershipType, requestId }))
      );
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as { customer?: string };
      const customerId = subscription.customer;

      if (!customerId) {
        logError('webhook.subscription_deleted', undefined, { reason: 'missing_customer_id', requestId });
        return new Response('Datos incompletos', { status: 400 });
      }

      const email = await getStripeCustomerEmail(customerId, env.STRIPE_SECRET_KEY);
      if (!email) {
        // Transient Stripe API failure — return 500 so Stripe retries
        logError('webhook.subscription_deleted', undefined, { customerId, reason: 'customer_email_not_found', requestId });
        return new Response('Cliente no encontrado', { status: 500 });
      }

      await lapseMembership(env, email, requestId);
      log('webhook.subscription_deleted', { email, requestId });
    }
  } catch (err) {
    logError('webhook.error', err, { eventType: event.type, requestId });
    // Return 500 so Stripe retries the event
    return new Response('Error interno', { status: 500 });
  }

  return new Response('OK', { status: 200 });
}

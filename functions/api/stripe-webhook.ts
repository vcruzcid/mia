// Stripe Webhook Handler for MIA Membership Management
// Handles subscription lifecycle events

import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20',
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role key for admin operations
);

interface RequestBody {
  type: string;
  data: {
    object: any;
  };
}

type CanonicalMembershipType = 'pleno_derecho' | 'estudiante' | 'colaborador';

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('Missing Stripe signature');
      return new Response('Missing signature', { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response('Invalid signature', { status: 400 });
    }

    console.log('Received webhook event:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response('Webhook handled successfully', { status: 200 });

  } catch (error) {
    console.error('Webhook handler error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout session completed:', session.id);

  try {
    // Get customer details
    const customer = await stripe.customers.retrieve(session.customer as string) as Stripe.Customer;
    
    // Get session metadata (should contain member registration data)
    const metadata = session.metadata || {};
    
    const email = (customer.email || metadata.email || '').toString().trim().toLowerCase();
    if (!email) {
      throw new Error('Stripe customer email is missing; cannot create member');
    }

    const membershipType = normalizeMembershipType(
      (metadata.membership_type || metadata.membershipType || metadata.membership || '').toString()
    );

    const firstName = (metadata.first_name || metadata.firstName || '').toString();
    const lastName = (metadata.last_name || metadata.lastName || '').toString();
    const phone = (metadata.phone || '').toString();

    // Try to find existing member by stripe_customer_id or email
    const existingByCustomer = await supabase
      .from('member_membership')
      .select('member_id')
      .eq('stripe_customer_id', customer.id)
      .maybeSingle();

    const existingByEmail = existingByCustomer.data?.member_id
      ? null
      : await supabase
          .from('member_private')
          .select('member_id')
          .ilike('email', email)
          .maybeSingle();

    let memberId = existingByCustomer.data?.member_id || existingByEmail?.data?.member_id;

    if (!memberId) {
      const created = await supabase
        .from('members')
        .insert({ is_active: false })
        .select('id')
        .single();

      if (created.error) throw created.error;
      memberId = created.data.id;

      const profileInsert = await supabase.from('member_profile').insert({
        member_id: memberId,
        first_name: firstName,
        last_name: lastName,
        accepts_newsletter: metadata.accepts_newsletter === 'true',
        accepts_job_offers: metadata.accepts_job_offers === 'true',
        privacy_level: 'public'
      });
      if (profileInsert.error) throw profileInsert.error;

      const privateInsert = await supabase.from('member_private').insert({
        member_id: memberId,
        email,
        phone: phone || null
      });
      if (privateInsert.error) throw privateInsert.error;
    }

    // Determine subscription details if present
    const subscriptionId = session.subscription ? String(session.subscription) : null;
    let subscriptionStatus: string | null = null;
    let currentPeriodEnd: Date | null = null;
    let cancelAtPeriodEnd: boolean | null = null;

    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      subscriptionStatus = subscription.status;
      currentPeriodEnd = subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null;
      cancelAtPeriodEnd = subscription.cancel_at_period_end ?? null;
    }

    // Upsert membership record
    const upsertMembership = await supabase
      .from('member_membership')
      .upsert({
        member_id: memberId,
        membership_type: membershipType,
        stripe_customer_id: customer.id,
        stripe_subscription_id: subscriptionId,
        stripe_subscription_status: subscriptionStatus,
        subscription_current_period_end: currentPeriodEnd ? currentPeriodEnd.toISOString() : null,
        cancel_at_period_end: cancelAtPeriodEnd ?? false,
        last_verified_at: new Date().toISOString()
      }, { onConflict: 'member_id' });

    if (upsertMembership.error) throw upsertMembership.error;

    // Log completion activity
    await supabase.from('member_activity').insert({
      member_id: memberId,
      activity_type: 'stripe_checkout_completed',
      activity_data: {
        stripe_session_id: session.id,
        stripe_customer_id: customer.id,
        stripe_subscription_id: subscriptionId,
        stripe_subscription_status: subscriptionStatus,
        membership_type: membershipType
      }
    });

    console.log('Member registration completed:', memberId);

    // Send welcome email
    await sendWelcomeEmail(email, firstName);

  } catch (error) {
    console.error('Error handling checkout session:', error);
    throw error;
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  console.log('Subscription changed:', subscription.id, subscription.status);

  try {
    const customerId = String(subscription.customer);

    // Find membership row by customer id and update
    const { data: mm, error: mmError } = await supabase
      .from('member_membership')
      .select('member_id')
      .eq('stripe_customer_id', customerId)
      .maybeSingle();
    if (mmError) throw mmError;
    if (!mm?.member_id) {
      console.warn('No member found for stripe_customer_id', customerId);
      return;
    }

    const { error } = await supabase
      .from('member_membership')
      .update({
        stripe_subscription_id: subscription.id,
        stripe_subscription_status: subscription.status,
        subscription_current_period_end: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null,
        cancel_at_period_end: subscription.cancel_at_period_end ?? false,
        last_verified_at: new Date().toISOString()
      })
      .eq('member_id', mm.member_id);

    if (error) throw error;

    console.log('Member subscription status updated');
  } catch (error) {
    console.error('Error updating subscription status:', error);
    throw error;
  }
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  console.log('Subscription canceled:', subscription.id);

  try {
    const customerId = String(subscription.customer);
    const { data: mm, error: mmError } = await supabase
      .from('member_membership')
      .select('member_id')
      .eq('stripe_customer_id', customerId)
      .maybeSingle();
    if (mmError) throw mmError;
    if (!mm?.member_id) {
      console.warn('No member found for stripe_customer_id', customerId);
      return;
    }

    const { error } = await supabase
      .from('member_membership')
      .update({
        stripe_subscription_status: 'canceled',
        last_verified_at: new Date().toISOString()
      })
      .eq('member_id', mm.member_id);

    if (error) throw error;

    // Send cancellation email
    const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
    await sendCancellationEmail(customer.email!);

  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
    throw error;
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Payment failed for invoice:', invoice.id);

  try {
    const customer = await stripe.customers.retrieve(invoice.customer as string) as Stripe.Customer;
    
    // Send payment failure notification
    await sendPaymentFailedEmail(customer.email!, invoice.amount_due / 100);

    // If this is the final attempt, deactivate member
    if (invoice.attempt_count >= 3) {
      const customerId = String(invoice.customer);
      const { data: mm, error: mmError } = await supabase
        .from('member_membership')
        .select('member_id')
        .eq('stripe_customer_id', customerId)
        .maybeSingle();
      if (mmError) throw mmError;
      if (!mm?.member_id) {
        console.warn('No member found for stripe_customer_id', customerId);
        return;
      }

      const { error } = await supabase
        .from('member_membership')
        .update({
          stripe_subscription_status: 'past_due',
          last_verified_at: new Date().toISOString()
        })
        .eq('member_id', mm.member_id);

      if (error) throw error;
    }

  } catch (error) {
    console.error('Error handling payment failure:', error);
    throw error;
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Payment succeeded for invoice:', invoice.id);

  try {
    const customerId = String(invoice.customer);
    const { data: mm, error: mmError } = await supabase
      .from('member_membership')
      .select('member_id')
      .eq('stripe_customer_id', customerId)
      .maybeSingle();
    if (mmError) throw mmError;
    if (!mm?.member_id) {
      console.warn('No member found for stripe_customer_id', customerId);
      return;
    }

    const { error } = await supabase
      .from('member_membership')
      .update({
        stripe_subscription_status: 'active',
        last_verified_at: new Date().toISOString()
      })
      .eq('member_id', mm.member_id);

    if (error) throw error;

  } catch (error) {
    console.error('Error handling payment success:', error);
    throw error;
  }
}

function normalizeMembershipType(input: string): CanonicalMembershipType {
  const v = input.trim().toLowerCase();
  if (
    v === 'pleno-derecho' ||
    v === 'pleno_derecho' ||
    v === 'socia-pleno-derecho' ||
    v === 'socia_pleno_derecho' ||
    v === 'socia-de-pleno-derecho' ||
    v === 'socia_de_pleno_derecho' ||
    v === 'profesional'
  ) return 'pleno_derecho';
  if (v === 'estudiante' || v === 'socia-estudiante' || v === 'socia_estudiante') return 'estudiante';
  if (v === 'colaborador' || v === 'colaboradora' || v === 'socio-colaborador' || v === 'socio_colaborador') return 'colaborador';
  return 'colaborador';
}

// Email functions (to be implemented with your email service)
async function sendWelcomeEmail(email: string, firstName: string) {
  console.log(`TODO: Send welcome email to ${email} (${firstName})`);
  
  // TODO: Implement with Supabase Edge Functions or email service
  // Include:
  // - Welcome message
  // - Member handbook attachment
  // - Portal access instructions
  // - Community guidelines
}

async function sendCancellationEmail(email: string) {
  console.log(`TODO: Send cancellation email to ${email}`);
  
  // TODO: Implement cancellation confirmation email
}

async function sendPaymentFailedEmail(email: string, amount: number) {
  console.log(`TODO: Send payment failed email to ${email} for amount ${amount}`);
  
  // TODO: Implement payment failure notification
}
// Stripe Webhook Handler for MIA Membership Management
// Handles subscription lifecycle events

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20',
});

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role key for admin operations
);

interface RequestBody {
  type: string;
  data: {
    object: any;
  };
}

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
    
    // Prepare member data for registration
    const memberData = {
      email: customer.email,
      stripe_customer_id: customer.id,
      first_name: metadata.first_name || '',
      last_name: metadata.last_name || '',
      phone: metadata.phone || '',
      city: metadata.city || '',
      province: metadata.province || '',
      autonomous_community: metadata.autonomous_community || '',
      membership_type: metadata.membership_type || 'colaborador',
      professions: metadata.professions || '',
      professional_level: metadata.professional_level || '',
      company: metadata.company || '',
      years_experience: metadata.years_experience || '0',
      accepts_newsletter: metadata.accepts_newsletter === 'true',
      accepts_job_offers: metadata.accepts_job_offers === 'true',
    };

    // Complete member registration
    const { data: memberId, error } = await supabase
      .rpc('complete_member_registration', {
        stripe_session_id: session.id,
        member_data: memberData
      });

    if (error) {
      throw error;
    }

    console.log('Member registration completed:', memberId);

    // Send welcome email
    await sendWelcomeEmail(customer.email!, memberData.first_name);

  } catch (error) {
    console.error('Error handling checkout session:', error);
    throw error;
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  console.log('Subscription changed:', subscription.id, subscription.status);

  try {
    await supabase.rpc('update_member_subscription_status', {
      stripe_customer_id_param: subscription.customer as string,
      subscription_status: subscription.status
    });

    console.log('Member subscription status updated');
  } catch (error) {
    console.error('Error updating subscription status:', error);
    throw error;
  }
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  console.log('Subscription canceled:', subscription.id);

  try {
    // Deactivate member
    await supabase.rpc('update_member_subscription_status', {
      stripe_customer_id_param: subscription.customer as string,
      subscription_status: 'canceled'
    });

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
      await supabase.rpc('update_member_subscription_status', {
        stripe_customer_id_param: customer.id,
        subscription_status: 'past_due'
      });
    }

  } catch (error) {
    console.error('Error handling payment failure:', error);
    throw error;
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Payment succeeded for invoice:', invoice.id);

  try {
    // Reactivate member if they were deactivated
    await supabase.rpc('update_member_subscription_status', {
      stripe_customer_id_param: invoice.customer as string,
      subscription_status: 'active'
    });

  } catch (error) {
    console.error('Error handling payment success:', error);
    throw error;
  }
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
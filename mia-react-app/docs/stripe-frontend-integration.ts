// Frontend Stripe integration utilities
// Install: npm install @stripe/stripe-js

import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe (do this once in your app)
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY!);

interface CheckoutSessionData {
  name: string;
  email: string;
  phone: string;
  membershipType: string;
  discountCode?: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    province: string;
    country: string;
  };
  finalPrice: number;
}

export async function createCheckoutSession(data: CheckoutSessionData): Promise<string> {
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const { sessionId } = await response.json();
    return sessionId;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

export async function redirectToCheckout(sessionId: string): Promise<void> {
  try {
    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error('Stripe failed to initialize');
    }

    const { error } = await stripe.redirectToCheckout({ sessionId });
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error redirecting to checkout:', error);
    throw error;
  }
}

// Combined function to create session and redirect
export async function processStripeCheckout(data: CheckoutSessionData): Promise<void> {
  try {
    const sessionId = await createCheckoutSession(data);
    await redirectToCheckout(sessionId);
  } catch (error) {
    console.error('Error processing Stripe checkout:', error);
    throw error;
  }
}

// Alternative: Handle checkout with direct URL redirect
export async function createCheckoutAndRedirect(data: CheckoutSessionData): Promise<void> {
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const { url } = await response.json();
    
    // Redirect directly using the URL
    window.location.href = url;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

// Utility to check if payment was successful (for success page)
export async function verifyPaymentSuccess(sessionId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/verify-payment/${sessionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return false;
    }

    const { paymentStatus } = await response.json();
    return paymentStatus === 'paid';
  } catch (error) {
    console.error('Error verifying payment:', error);
    return false;
  }
}

// Environment variables you'll need in your .env file:
/*
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=http://localhost:3000
*/
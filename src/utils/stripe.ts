import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
    if (!publishableKey) {
      console.error('Missing VITE_STRIPE_PUBLIC_KEY');
      return null;
    }
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

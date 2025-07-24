# Stripe Integration Guide for MIA Registration

## Overview

This guide explains how to pass user information (name, email, phone) to Stripe payment processing for the MIA membership registration form.

## Two Approaches

### 1. Stripe Payment Links (Current - Limited)
- Static URLs that only accept limited parameters
- Can pre-fill email: `?prefilled_email=user@example.com`
- **Cannot** pass name or phone directly
- Good for simple implementations

### 2. Stripe Checkout Sessions (Recommended)
- Dynamic sessions created via API
- Can pass all customer information
- Better user experience
- More control over payment flow

## Implementation Options

### Option A: Enhanced Payment Links (Quick Fix)
Currently implemented in the code with email prefill:

```javascript
// In handlePaidMembershipRegistration
const url = new URL(stripeUrl);
url.searchParams.set('prefilled_email', data.email);
window.location.href = url.toString();
```

**Pros:**
- Simple to implement
- No backend changes needed
- Works with existing Payment Links

**Cons:**
- Only email can be prefilled
- Name and phone must be entered manually
- Less flexible

### Option B: Stripe Checkout Sessions (Best Practice)

**Backend Implementation** (see `docs/stripe-checkout-api-example.js`):
- Create dynamic checkout sessions
- Pass all customer data
- Handle webhooks for payment confirmation
- Store customer information in Stripe

**Frontend Integration** (see `docs/stripe-frontend-integration.ts`):
- Call backend API to create session
- Redirect to Stripe Checkout
- Handle success/failure responses

## What Information Can Be Passed

### With Checkout Sessions (Full Control):
```javascript
const customer = await stripe.customers.create({
  name: "María García",           // ✅ Full name
  email: "maria@example.com",     // ✅ Email
  phone: "+34666123456",          // ✅ Phone number
  address: {                      // ✅ Full address
    line1: "Calle Mayor 123",
    city: "Madrid",
    postal_code: "28001",
    state: "Madrid",
    country: "ES",
  },
  metadata: {                     // ✅ Custom data
    membershipType: "pleno-derecho",
    discountCode: "EARLYBIRD",
    categories: "Animación 2D, Dirección",
  }
});
```

### With Payment Links (Limited):
```javascript
// Only these parameters work:
const url = new URL(paymentLink);
url.searchParams.set('prefilled_email', email);  // ✅ Email only
// name and phone cannot be passed directly
```

## Implementation Steps

### Step 1: Install Dependencies
```bash
npm install @stripe/stripe-js
```

### Step 2: Set Environment Variables
```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Step 3: Create Backend API
Use the example in `docs/stripe-checkout-api-example.js` as a starting point.

### Step 4: Update Frontend
Replace the current payment link redirection with Checkout Session creation.

### Step 5: Handle Success/Failure
Create success and cancel pages to handle post-payment flow.

## Current Implementation Status

The registration form currently:
- ✅ Collects all required user information
- ✅ Validates data with Zod schemas
- ✅ Calculates pricing with discount codes
- ✅ Pre-fills email in Payment Links
- ⏳ Ready for Checkout Session integration

## Next Steps

1. **Immediate (Payment Links)**: Already implemented email prefill
2. **Short-term**: Implement Checkout Sessions for full data passing
3. **Long-term**: Add webhook handling for payment confirmation

## Benefits of Full Integration

### User Experience:
- No need to re-enter information
- Faster checkout process
- Consistent branding
- Better mobile experience

### Business Benefits:
- Higher conversion rates
- Better customer data management
- Automated membership activation
- Detailed payment analytics

### Technical Benefits:
- Webhook-based payment confirmation
- Automatic customer record creation
- Flexible pricing and discounts
- Better error handling

## Security Considerations

- Never expose secret keys in frontend code
- Use HTTPS for all API communications
- Validate webhook signatures
- Store sensitive data securely
- Follow PCI compliance guidelines

## Testing

### Test Cards (Stripe Test Mode):
- Success: `4242424242424242`
- Decline: `4000000000000002`
- 3D Secure: `4000002500003155`

### Test Workflow:
1. Fill registration form
2. Submit with test membership
3. Redirect to Stripe Checkout
4. Use test card
5. Verify webhook handling
6. Check user activation

## Support

For implementation assistance:
- Stripe Documentation: https://stripe.com/docs
- Integration examples in `docs/` folder
- Test the flow in Stripe Dashboard
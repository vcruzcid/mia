// Example Node.js/Express backend endpoint for creating Stripe Checkout Sessions
// This file is for reference only - implement this in your backend

const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();

app.use(express.json());

// Membership pricing configuration
const MEMBERSHIP_PRICES = {
  'pleno-derecho': 60,
  'colaborador': 60,
  'estudiante': 30,
  'newsletter': 0,
};

// Discount codes (should be stored in database in production)
const VALID_DISCOUNT_CODES = {
  'DIRECTIVA2024': { percentage: 50, description: 'Descuento para miembros de directiva' },
  'ESTUDIANTE25': { percentage: 25, description: 'Descuento estudiantes' },
  'EARLYBIRD': { percentage: 15, description: 'Descuento madrugador' },
  'AMIGA10': { percentage: 10, description: 'Descuento por recomendación' },
};

function calculateDiscountedPrice(originalPrice, discountCode) {
  if (!discountCode || !VALID_DISCOUNT_CODES[discountCode]) {
    return {
      originalPrice,
      discountPercentage: 0,
      discountAmount: 0,
      finalPrice: originalPrice,
      isValid: false,
    };
  }

  const discount = VALID_DISCOUNT_CODES[discountCode];
  const discountAmount = Math.round((originalPrice * discount.percentage) / 100);
  const finalPrice = originalPrice - discountAmount;

  return {
    originalPrice,
    discountPercentage: discount.percentage,
    discountAmount,
    finalPrice: Math.max(0, finalPrice),
    isValid: true,
  };
}

app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      membershipType,
      discountCode,
      address,
      // Any other user data you want to store
    } = req.body;

    // Calculate pricing
    const originalPrice = MEMBERSHIP_PRICES[membershipType] || 0;
    const pricingInfo = calculateDiscountedPrice(originalPrice, discountCode);

    // Create or update customer in Stripe
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
      // Update customer info
      await stripe.customers.update(customer.id, {
        name,
        phone,
        address: {
          line1: address.street,
          city: address.city,
          postal_code: address.postalCode,
          state: address.province,
          country: 'ES', // Spain
        },
        metadata: {
          membershipType,
          discountCode: discountCode || '',
        },
      });
    } else {
      // Create new customer
      customer = await stripe.customers.create({
        name,
        email,
        phone,
        address: {
          line1: address.street,
          city: address.city,
          postal_code: address.postalCode,
          state: address.province,
          country: 'ES',
        },
        metadata: {
          membershipType,
          discountCode: discountCode || '',
        },
      });
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Membresía MIA - ${getMembershipDisplayName(membershipType)}`,
              description: `Membresía anual para ${name}`,
              images: ['https://your-domain.com/membership-image.jpg'], // Optional
            },
            unit_amount: pricingInfo.finalPrice * 100, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment', // or 'subscription' for recurring payments
      
      // Success and cancel URLs
      success_url: `${process.env.FRONTEND_URL}/registro/exito?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/registro?canceled=true`,
      
      // Store metadata for webhooks
      metadata: {
        membershipType,
        userId: 'user_id_here', // Your internal user ID after creating user in your DB
        discountCode: discountCode || '',
        originalPrice: originalPrice.toString(),
        finalPrice: pricingInfo.finalPrice.toString(),
      },

      // Pre-fill billing details
      billing_address_collection: 'required',
      
      // Automatic tax calculation (if enabled)
      automatic_tax: { enabled: true },
      
      // Custom fields for additional info
      custom_fields: [
        {
          key: 'membership_preference',
          label: { type: 'custom', custom: 'Preferencias de membresía' },
          type: 'dropdown',
          dropdown: {
            options: [
              { label: 'Newsletter mensual', value: 'monthly' },
              { label: 'Newsletter semanal', value: 'weekly' },
              { label: 'Newsletter trimestral', value: 'quarterly' },
            ],
          },
        },
      ],

      // Invoice creation for record keeping
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: `Membresía MIA ${new Date().getFullYear()}`,
          metadata: {
            membershipType,
            discountCode: discountCode || '',
          },
          footer: 'Gracias por unirte a Mujeres en la Industria de Animación',
        },
      },
    });

    // In production, save the session and user data to your database here
    // await saveUserRegistration({ ...req.body, stripeSessionId: session.id });

    res.json({ 
      sessionId: session.id,
      url: session.url // Alternative: send the URL directly
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ 
      error: 'Error creating checkout session',
      message: error.message 
    });
  }
});

// Webhook to handle successful payments
app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('Payment successful:', session.id);
      
      // Update user status in your database
      // await updateUserMembershipStatus(session.metadata.userId, 'active');
      
      // Send welcome email
      // await sendWelcomeEmail(session.customer_details.email);
      
      break;
    
    case 'payment_intent.payment_failed':
      console.log('Payment failed:', event.data.object.id);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

function getMembershipDisplayName(membershipType) {
  const names = {
    'pleno-derecho': 'Socia de Pleno Derecho',
    'colaborador': 'Colaborador',
    'estudiante': 'Estudiante',
    'newsletter': 'Newsletter',
  };
  return names[membershipType] || membershipType;
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
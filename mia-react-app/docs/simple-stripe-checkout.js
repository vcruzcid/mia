// Simplified Stripe Checkout API - Collect minimal info upfront, get user details from Stripe after payment
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

const MEMBERSHIP_NAMES = {
  'pleno-derecho': 'Socia de Pleno Derecho',
  'colaborador': 'Colaborador',
  'estudiante': 'Estudiante',
  'newsletter': 'Newsletter Gratuito',
};

// Discount codes
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

// Simplified checkout session - minimal data collection upfront
app.post('/api/create-simple-checkout', async (req, res) => {
  try {
    const {
      membershipType,
      amount,
      originalAmount,
      discountCode,
      discountPercentage,
      collectShipping,
      mode = 'payment'
    } = req.body;

    // For newsletter (free), create a setup session to collect email only
    if (membershipType === 'newsletter') {
      const session = await stripe.checkout.sessions.create({
        mode: 'setup',
        success_url: `${process.env.FRONTEND_URL}/registro/bienvenida?session_id={CHECKOUT_SESSION_ID}&membership=newsletter`,
        cancel_url: `${process.env.FRONTEND_URL}/registro?canceled=true`,
        
        // Just collect basic customer info
        customer_creation: 'always',
        
        // Don't require payment method for free newsletter
        payment_method_types: [],
        
        // Custom text and branding
        custom_text: {
          submit: { message: 'Suscribirse al Newsletter Gratuito' },
        },
        
        // Collect basic information
        phone_number_collection: { enabled: false }, // Optional for newsletter
        
        metadata: {
          membershipType: 'newsletter',
          amount: '0',
          source: 'website_registration',
        },

        // Collect email via customer email field
        customer_email: undefined, // Let Stripe collect it
      });

      return res.json({ 
        sessionId: session.id,
        url: session.url 
      });
    }

    // For paid memberships, create payment session
    const pricingInfo = calculateDiscountedPrice(originalAmount || amount, discountCode);
    
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      
      // Line items
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `${MEMBERSHIP_NAMES[membershipType]} - MIA`,
            description: 'Membresía anual - Mujeres en la Industria de Animación',
            images: [`${process.env.FRONTEND_URL}/api/membership-image/${membershipType}`],
          },
          unit_amount: pricingInfo.finalPrice * 100, // Convert to cents
        },
        quantity: 1,
      }],

      // Success and cancel URLs
      success_url: `${process.env.FRONTEND_URL}/registro/bienvenida?session_id={CHECKOUT_SESSION_ID}&membership=${membershipType}`,
      cancel_url: `${process.env.FRONTEND_URL}/registro?canceled=true&membership=${membershipType}`,

      // Customer creation and data collection
      customer_creation: 'always',
      
      // Collect billing address for paid memberships
      billing_address_collection: collectShipping ? 'required' : 'auto',
      
      // Collect shipping address for physical materials (if any)
      shipping_address_collection: collectShipping ? {
        allowed_countries: ['ES', 'PT', 'FR', 'IT', 'DE'], // EU countries
      } : undefined,

      // Collect phone number
      phone_number_collection: {
        enabled: true,
      },

      // Store metadata for later processing
      metadata: {
        membershipType,
        originalAmount: originalAmount?.toString() || amount.toString(),
        finalAmount: pricingInfo.finalPrice.toString(),
        discountCode: discountCode || '',
        discountPercentage: discountPercentage?.toString() || '0',
        source: 'website_registration',
        registrationDate: new Date().toISOString(),
      },

      // Automatic tax calculation (if configured)
      automatic_tax: { enabled: true },

      // Custom fields to collect additional member info
      custom_fields: [
        {
          key: 'professional_categories',
          label: { 
            type: 'custom', 
            custom: '¿Cuáles son tus principales áreas de especialización?' 
          },
          type: 'text',
          optional: false,
        },
        {
          key: 'experience_level',
          label: { 
            type: 'custom', 
            custom: 'Nivel de experiencia' 
          },
          type: 'dropdown',
          dropdown: {
            options: [
              { label: 'Estudiante', value: 'student' },
              { label: 'Junior (0-2 años)', value: 'junior' },
              { label: 'Mid (2-5 años)', value: 'mid' },
              { label: 'Senior (5-10 años)', value: 'senior' },
              { label: 'Lead (10+ años)', value: 'lead' },
              { label: 'Director/Executive', value: 'director' },
              { label: 'Freelance', value: 'freelance' },
            ],
          },
          optional: false,
        },
        {
          key: 'company_or_institution',
          label: { 
            type: 'custom', 
            custom: 'Empresa/Institución (opcional)' 
          },
          type: 'text',
          optional: true,
        },
      ],

      // Invoice creation for accounting
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: `Membresía MIA ${new Date().getFullYear()} - ${MEMBERSHIP_NAMES[membershipType]}`,
          metadata: {
            membershipType,
            discountCode: discountCode || '',
            finalAmount: pricingInfo.finalPrice.toString(),
          },
          footer: 'Gracias por unirte a Mujeres en la Industria de Animación (MIA)',
        },
      },

      // Custom text for better UX
      custom_text: {
        submit: { 
          message: `Completar pago - €${pricingInfo.finalPrice}` 
        },
        shipping_address: collectShipping ? { 
          message: 'Dirección para envío de materiales de membresía (si aplica)' 
        } : undefined,
      },

      // Consent collection for GDPR
      consent_collection: {
        terms_of_service: 'required',
        privacy_policy: 'required',
      },
    });

    res.json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ 
      error: 'Error creating checkout session',
      message: error.message 
    });
  }
});

// Get customer details after successful payment
app.get('/api/get-customer-details/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Retrieve the session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Get customer details
    const customer = await stripe.customers.retrieve(session.customer);
    
    // Get payment intent details (for paid memberships)
    let paymentIntent = null;
    if (session.payment_intent) {
      paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
    }

    // Extract user information from Stripe
    const userInfo = {
      // Basic info from customer
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      
      // Address from billing/shipping
      address: {
        line1: customer.address?.line1 || session.shipping_details?.address?.line1,
        line2: customer.address?.line2 || session.shipping_details?.address?.line2,
        city: customer.address?.city || session.shipping_details?.address?.city,
        postal_code: customer.address?.postal_code || session.shipping_details?.address?.postal_code,
        state: customer.address?.state || session.shipping_details?.address?.state,
        country: customer.address?.country || session.shipping_details?.address?.country,
      },
      
      // Custom fields from checkout
      customFields: session.custom_fields?.reduce((acc, field) => {
        acc[field.key] = field.text?.value || field.dropdown?.value;
        return acc;
      }, {}),
      
      // Session metadata
      membershipInfo: {
        type: session.metadata.membershipType,
        originalAmount: parseFloat(session.metadata.originalAmount || '0'),
        finalAmount: parseFloat(session.metadata.finalAmount || '0'),
        discountCode: session.metadata.discountCode || null,
        discountPercentage: parseFloat(session.metadata.discountPercentage || '0'),
        registrationDate: session.metadata.registrationDate,
      },
      
      // Payment details
      paymentInfo: paymentIntent ? {
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100, // Convert from cents
        currency: paymentIntent.currency,
        paymentMethod: paymentIntent.payment_method,
      } : null,
      
      // Stripe IDs for reference
      stripeCustomerId: customer.id,
      stripeSessionId: sessionId,
    };

    res.json({ userInfo });

  } catch (error) {
    console.error('Error retrieving customer details:', error);
    res.status(500).json({ 
      error: 'Error retrieving customer details',
      message: error.message 
    });
  }
});

// Webhook to process completed payments and activate memberships
app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed':
      handleCheckoutCompleted(event.data.object);
      break;
      
    case 'payment_intent.succeeded':
      console.log('Payment succeeded:', event.data.object.id);
      break;
      
    case 'payment_intent.payment_failed':
      console.log('Payment failed:', event.data.object.id);
      // Handle failed payment
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

async function handleCheckoutCompleted(session) {
  try {
    console.log('Checkout completed for session:', session.id);
    
    // Get customer details
    const customer = await stripe.customers.retrieve(session.customer);
    
    const membershipData = {
      stripeCustomerId: customer.id,
      stripeSessionId: session.id,
      membershipType: session.metadata.membershipType,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      amount: session.metadata.finalAmount,
      discountCode: session.metadata.discountCode,
      registrationDate: session.metadata.registrationDate,
      customFields: session.custom_fields,
      status: 'active',
    };

    // Save to your database
    // await saveMembershipToDatabase(membershipData);
    
    // Send welcome email with profile completion link
    // await sendWelcomeEmail(customer.email, {
    //   name: customer.name,
    //   membershipType: session.metadata.membershipType,
    //   profileCompletionUrl: `${process.env.FRONTEND_URL}/perfil/completar?session=${session.id}`
    // });
    
    console.log('Membership activated:', membershipData);
    
  } catch (error) {
    console.error('Error processing completed checkout:', error);
  }
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
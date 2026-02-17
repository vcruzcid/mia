// Cloudflare Pages Function for retrieving Stripe checkout session details
// Gets data from Stripe API to show user what they purchased and collect additional info

interface Env {
  STRIPE_SECRET_KEY: string;
}

// Define response types
interface CustomerDetails {
  email: string;
  name?: string;
  membershipType?: string;
  paymentInfo: {
    status: string;
    amount: number;
    currency: string;
  };
  stripeCustomerId: string;
  stripeSessionId: string;
}

export async function onRequestGet(context: { request: Request; env: Env; params: { sessionId: string } }) {
  const { request, env, params } = context;
  const { sessionId } = params;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Initialize Stripe
    const stripe = (await import('stripe')).default;
    const stripeClient = new stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20',
    });

    // Retrieve the checkout session with expanded line items (needed for membership type)
    const session = await stripeClient.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items']
    });

    if (!session) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Session not found',
        }),
        { status: 404, headers: corsHeaders }
      );
    }

    // Extract membership type from line items or metadata
    let membershipType = '';
    if (session.line_items?.data?.[0]?.description) {
      const description = session.line_items.data[0].description.toLowerCase();
      if (description.includes('estudiante')) membershipType = 'estudiante';
      else if (description.includes('colaborador')) membershipType = 'colaborador';
      else if (description.includes('pleno')) membershipType = 'pleno-derecho';
    }

    const userInfo: CustomerDetails = {
      email: session.customer_details?.email || session.customer_email || '',
      name: session.customer_details?.name || '',
      membershipType: membershipType,
      paymentInfo: {
        status: session.payment_status,
        amount: session.amount_total || 0,
        currency: session.currency || 'eur',
      },
      stripeCustomerId: typeof session.customer === 'string' ? session.customer : customer?.id || '',
      stripeSessionId: session.id,
    };

    return new Response(
      JSON.stringify({
        success: true,
        userInfo,
      }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('Error retrieving session details:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error retrieving session information',
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}
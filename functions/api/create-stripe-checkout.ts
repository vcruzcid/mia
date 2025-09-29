import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient()
})

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { priceId, memberEmail, customerId } = await req.json()

    if (!priceId || !memberEmail) {
      throw new Error('Price ID and member email are required')
    }

    const baseUrl = new URL(req.url).origin

    // Create checkout session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      customer_email: customerId ? undefined : memberEmail,
      customer: customerId,
      success_url: `${baseUrl}/portal?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${baseUrl}/portal?tab=payment&cancelled=true`,
      metadata: {
        member_email: memberEmail,
      },
      subscription_data: {
        metadata: {
          member_email: memberEmail,
        },
      },
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error creating Stripe checkout session:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred creating checkout session' 
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
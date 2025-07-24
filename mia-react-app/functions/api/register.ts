// Cloudflare Pages Function for registration with Turnstile verification
import type { RegistrationRequest, RegistrationResponse, TurnstileVerifyResponse } from '../../src/types/api';

interface Env {
  ZAPIER_WEBHOOK_URL: string;
  TURNSTILE_SECRET_KEY: string;
}

// Turnstile verification
async function verifyTurnstile(token: string, secretKey: string, remoteip?: string): Promise<boolean> {
  const formData = new FormData();
  formData.append('secret', secretKey);
  formData.append('response', token);
  if (remoteip) {
    formData.append('remoteip', remoteip);
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    const result: TurnstileVerifyResponse = await response.json();
    return result.success;
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return false;
  }
}

// Main handler
export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Parse request body
    const body: RegistrationRequest = await request.json();

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'membershipType', 'turnstileToken'];
    const missingFields = requiredFields.filter(field => !body[field as keyof RegistrationRequest]);
    
    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Campos requeridos faltantes: ${missingFields.join(', ')}`,
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Verify Turnstile token
    const clientIP = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For');
    const turnstileValid = await verifyTurnstile(body.turnstileToken, env.TURNSTILE_SECRET_KEY, clientIP || undefined);

    if (!turnstileValid) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Verificación de seguridad fallida. Por favor, inténtalo de nuevo.',
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Prepare data for Zapier webhook
    const webhookData = {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone || '',
      membershipType: body.membershipType,
      discountCode: body.discountCode || '',
      acceptTerms: body.acceptTerms,
      acceptNewsletter: body.acceptNewsletter,
      gdprAccepted: body.gdprAccepted,
      timestamp: new Date().toISOString(),
      source: 'mia-website',
      userAgent: request.headers.get('User-Agent') || '',
      ip: clientIP || '',
    };

    // Send to Zapier webhook
    const zapierResponse = await fetch(env.ZAPIER_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData),
    });

    if (!zapierResponse.ok) {
      console.error('Zapier webhook failed:', zapierResponse.status, zapierResponse.statusText);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Error procesando el registro. Por favor, inténtalo de nuevo.',
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Parse Zapier response
    let zapierData;
    try {
      zapierData = await zapierResponse.json();
    } catch {
      zapierData = {};
    }

    // Generate response
    const response: RegistrationResponse = {
      success: true,
      message: 'Registro completado exitosamente',
      redirectUrl: zapierData.redirectUrl || zapierData.stripe_url || undefined,
    };

    // If it's a paid membership but no redirect URL, generate a default one
    if (body.membershipType !== 'newsletter' && !response.redirectUrl) {
      // These would be your actual Stripe payment URLs from site config
      const stripeUrls: Record<string, string> = {
        'estudiante': 'https://buy.stripe.com/test_student',
        'colaboradora': 'https://buy.stripe.com/test_collaborator',
        'pleno-derecho': 'https://buy.stripe.com/test_full',
      };
      
      response.redirectUrl = stripeUrls[body.membershipType];
    }

    return new Response(
      JSON.stringify({ success: true, data: response }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('Registration error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error interno del servidor. Por favor, inténtalo de nuevo.',
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}
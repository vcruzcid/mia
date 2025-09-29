// Cloudflare Pages Function for contact form with Turnstile verification
import type { ContactRequest, ContactResponse, TurnstileVerifyResponse } from '../../src/types/api';

interface Env {
  ZAPIER_WEBHOOK_URL: string;
  TURNSTILE_SECRET_KEY: string;
}

// Turnstile verification (same as register.ts)
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

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

// Main handler
export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Parse request body
    const body: ContactRequest = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'email', 'subject', 'message', 'turnstileToken'];
    const missingFields = requiredFields.filter(field => !body[field as keyof ContactRequest]);
    
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
      name: body.name,
      email: body.email,
      subject: body.subject,
      message: body.message,
      timestamp: new Date().toISOString(),
      source: 'mia-contact-form',
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
          error: 'Error enviando mensaje. Por favor, inténtalo de nuevo.',
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Generate response
    const response: ContactResponse = {
      success: true,
      message: '¡Gracias por tu mensaje! Te responderemos pronto.',
    };

    return new Response(
      JSON.stringify({ success: true, data: response }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error interno del servidor. Por favor, inténtalo de nuevo.',
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}
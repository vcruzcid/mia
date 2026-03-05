// Cloudflare Pages Function for contact form with Turnstile verification
import type { ContactRequest, ContactResponse, TurnstileVerifyResponse } from '../../src/types/api';
import { sendContactNotification } from '../_lib/email';
import { log, warn, logError } from '../_lib/logger';

interface Env {
  RESEND_API_KEY: string;
  TURNSTILE_SECRET_KEY: string;
  CONTACT_RECIPIENT_EMAIL: string;
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
    logError('contact.turnstile_error', error);
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

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

// Main handler
export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  try {
    // Parse request body
    const body: ContactRequest = await request.json();

    log('contact.received', { email: body.email });

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
      warn('contact.turnstile_failed', { email: body.email });
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Verificación de seguridad fallida. Por favor, inténtalo de nuevo.',
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Send email notification via Resend
    try {
      await sendContactNotification(env.RESEND_API_KEY, env.CONTACT_RECIPIENT_EMAIL, {
        name: body.name,
        email: body.email,
        subject: body.subject,
        message: body.message,
      });
    } catch (emailErr) {
      logError('contact.email_failed', emailErr, { email: body.email });
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Error interno del servidor. Por favor, inténtalo de nuevo.',
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    log('contact.sent', { email: body.email });

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
    logError('contact.error', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error interno del servidor. Por favor, inténtalo de nuevo.',
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}

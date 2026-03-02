// Resend email utility — uses REST API directly (no npm package, better Workers compatibility)
const RESEND_API = 'https://api.resend.com/emails';

interface EmailPayload {
  from: string;
  to: string | string[];
  reply_to?: string;
  subject: string;
  html: string;
}

export async function sendEmail(apiKey: string, payload: EmailPayload): Promise<void> {
  const res = await fetch(RESEND_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend API error ${res.status}: ${body}`);
  }
}

// ─── Shared layout ────────────────────────────────────────────────────────────

function wrapInLayout(content: string, showSocialIcons: boolean): string {
  const socialBlock = showSocialIcons
    ? `
      <tr>
        <td align="center" style="padding: 24px 40px 0 40px;">
          <p style="margin: 0 0 16px 0; font-size: 14px; color: #aaaaaa; font-family: 'Poppins', Helvetica, Arial, sans-serif;">
            Síguenos en redes
          </p>
          <table cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding: 0 8px;">
                <a href="https://instagram.com/animacionesmia" target="_blank">
                  <img src="https://cdn-images.mailchimp.com/icons/social-block-v3/color-instagram-48.png"
                       alt="Instagram" width="32" height="32" style="display:block;" />
                </a>
              </td>
              <td style="padding: 0 8px;">
                <a href="https://linkedin.com/company/animacionesmia" target="_blank">
                  <img src="https://cdn-images.mailchimp.com/icons/social-block-v3/color-linkedin-48.png"
                       alt="LinkedIn" width="32" height="32" style="display:block;" />
                </a>
              </td>
              <td style="padding: 0 8px;">
                <a href="https://twitter.com/animacionesmia" target="_blank">
                  <img src="https://cdn-images.mailchimp.com/icons/social-block-v3/color-twitter-48.png"
                       alt="Twitter / X" width="32" height="32" style="display:block;" />
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    : '';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MIA</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f4; font-family:'Poppins',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4; padding: 24px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0"
               style="max-width:600px; width:100%; background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color:#1d1d1b; padding: 24px 40px; text-align:center;">
              <a href="https://animacionesmia.com" target="_blank">
                <img src="https://animacionesmia.com/logo-main.png"
                     alt="MIA — Mujeres en la Industria de la Animación"
                     width="160" height="auto"
                     style="display:block; margin:0 auto;" />
              </a>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="background-color:#ffffff;">
              ${content}
            </td>
          </tr>

          ${socialBlock}

          <!-- Footer -->
          <tr>
            <td style="background-color:#1d1d1b; padding: 24px 40px; text-align:center;">
              <a href="https://animacionesmia.com" target="_blank">
                <img src="https://animacionesmia.com/logo-main.png"
                     alt="MIA" width="80" height="auto"
                     style="display:block; margin: 0 auto 16px auto; opacity:0.8;" />
              </a>
              <p style="margin:0 0 8px 0; font-size:12px; color:#aaaaaa; font-family:'Poppins',Helvetica,Arial,sans-serif;">
                © 2025 MIA — Mujeres en la Industria de la Animación
              </p>
              <p style="margin:0; font-size:12px; font-family:'Poppins',Helvetica,Arial,sans-serif;">
                <a href="https://animacionesmia.com" style="color:#d8242e; text-decoration:none;">
                  Visitar sitio web
                </a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Contact notification ─────────────────────────────────────────────────────

interface ContactData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function sendContactNotification(apiKey: string, recipientEmail: string, data: ContactData): Promise<void> {
  const timestamp = new Date().toLocaleString('es-ES', {
    timeZone: 'Europe/Madrid',
    dateStyle: 'long',
    timeStyle: 'short',
  });

  const content = `
    <table style="margin: 40px auto; width: calc(100% - 80px); border-collapse: collapse;">
      <tr>
        <td colspan="2" style="padding: 0 0 24px 0; font-size: 20px; font-weight: 600; color: #1d1d1b; font-family:'Poppins',Helvetica,Arial,sans-serif;">
          Nuevo mensaje de contacto
        </td>
      </tr>
      <tr style="border-bottom: 1px solid #f0f0f0;">
        <td style="padding: 12px 0; font-weight: 600; color: #555; width: 100px; font-family:'Poppins',Helvetica,Arial,sans-serif;">Nombre</td>
        <td style="padding: 12px 0; color: #333; font-family:'Poppins',Helvetica,Arial,sans-serif;">${escapeHtml(data.name)}</td>
      </tr>
      <tr style="border-bottom: 1px solid #f0f0f0;">
        <td style="padding: 12px 0; font-weight: 600; color: #555; font-family:'Poppins',Helvetica,Arial,sans-serif;">Email</td>
        <td style="padding: 12px 0; font-family:'Poppins',Helvetica,Arial,sans-serif;">
          <a href="mailto:${escapeHtml(data.email)}" style="color:#d8242e;">${escapeHtml(data.email)}</a>
        </td>
      </tr>
      <tr style="border-bottom: 1px solid #f0f0f0;">
        <td style="padding: 12px 0; font-weight: 600; color: #555; font-family:'Poppins',Helvetica,Arial,sans-serif;">Asunto</td>
        <td style="padding: 12px 0; color: #333; font-family:'Poppins',Helvetica,Arial,sans-serif;">${escapeHtml(data.subject)}</td>
      </tr>
      <tr>
        <td colspan="2" style="padding: 20px 0 0 0; font-weight: 600; color: #555; font-family:'Poppins',Helvetica,Arial,sans-serif;">Mensaje</td>
      </tr>
      <tr>
        <td colspan="2" style="padding: 12px 16px; background: #f8f9fa; border-radius: 6px; color: #333; line-height: 1.6; white-space: pre-wrap; font-family:'Poppins',Helvetica,Arial,sans-serif;">${escapeHtml(data.message)}</td>
      </tr>
      <tr>
        <td colspan="2" style="padding: 16px 0 0 0; font-size: 12px; color: #999; font-family:'Poppins',Helvetica,Arial,sans-serif;">
          Enviado el ${timestamp} desde animacionesmia.com
        </td>
      </tr>
    </table>`;

  await sendEmail(apiKey, {
    from: 'noreply@animacionesmia.com',
    to: recipientEmail,
    reply_to: data.email,
    subject: '[MIA Website] - Contacto desde la página web',
    html: wrapInLayout(content, false),
  });
}

// ─── Magic link email ─────────────────────────────────────────────────────────

export async function sendMagicLinkEmail(
  apiKey: string,
  memberEmail: string,
  magicLink: string,
): Promise<void> {
  const content = `
    <table style="margin: 0 auto; width: calc(100% - 80px);">
      <tr>
        <td style="padding: 40px 0 16px 0; font-size: 20px; font-weight: 600; color: #1d1d1b; font-family:'Poppins',Helvetica,Arial,sans-serif;">
          Tu enlace de acceso al portal
        </td>
      </tr>
      <tr>
        <td style="padding: 0 0 32px 0; font-size: 16px; line-height: 1.6; color: #555; font-family:'Poppins',Helvetica,Arial,sans-serif;">
          Hemos recibido tu solicitud de acceso al portal de socias de MIA.<br>
          Haz clic en el botón de abajo para acceder. <strong>El enlace es válido durante 15 minutos</strong>
          y solo puede usarse una vez.
        </td>
      </tr>
      <tr>
        <td align="center" style="padding-bottom: 32px;">
          <a href="${escapeHtml(magicLink)}" target="_blank"
             style="display:inline-block; background:#d8242e; color:#ffffff; font-family:'Poppins',Helvetica,Arial,sans-serif;
                    font-size:16px; font-weight:600; text-decoration:none; padding:14px 40px; border-radius:6px;">
            Acceder al portal
          </a>
        </td>
      </tr>
      <tr>
        <td style="font-size: 13px; color: #999; line-height: 1.5; padding-bottom: 8px; font-family:'Poppins',Helvetica,Arial,sans-serif;">
          Si no solicitaste este enlace, puedes ignorar este correo con seguridad.<br>
          ¿Problemas para acceder?
          <a href="https://animacionesmia.com/contacto" style="color:#d8242e;">Contáctanos</a>.
        </td>
      </tr>
    </table>`;

  await sendEmail(apiKey, {
    from: 'noreply@animacionesmia.com',
    to: memberEmail,
    subject: 'Tu enlace de acceso al portal MIA',
    html: wrapInLayout(content, true),
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

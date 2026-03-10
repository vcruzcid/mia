// Resend email utility — uses REST API directly (no npm package, better Workers compatibility)
import { log } from './logger';

const RESEND_API = 'https://api.resend.com/emails';

// ─── Shared assets ─────────────────────────────────────────────────────────────

// Logo variants inlined as base64 PNG — avoids external image blocking in email clients
const LOGO_HEADER = 'data:image/png;base64,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';
const LOGO_FOOTER = 'data:image/png;base64,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'; // white variant for dark backgrounds

// Social icons inlined as base64 SVG — no external CDN dependency
const ICON_INSTAGRAM = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiIgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIj48cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHJ4PSI4IiBmaWxsPSIjQzEzNTg0Ii8+PHJlY3QgeD0iOSIgeT0iOSIgd2lkdGg9IjE0IiBoZWlnaHQ9IjE0IiByeD0iNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIi8+PGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMy41IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiLz48Y2lyY2xlIGN4PSIyMiIgY3k9IjEwIiByPSIxLjUiIGZpbGw9IndoaXRlIi8+PC9zdmc+';
const ICON_LINKEDIN  = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiIgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIj48cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHJ4PSI0IiBmaWxsPSIjMEE2NkMyIi8+PHJlY3QgeD0iOSIgeT0iMTMiIHdpZHRoPSIzIiBoZWlnaHQ9IjEwIiBmaWxsPSJ3aGl0ZSIvPjxjaXJjbGUgY3g9IjEwLjUiIGN5PSIxMC41IiByPSIxLjciIGZpbGw9IndoaXRlIi8+PHBhdGggZD0iTTE1IDEzaDIuOHYxLjRjLjQtLjggMS41LTEuNSAzLTEuNSAzLjIgMCAzLjcgMi4xIDMuNyA0LjhWMjNoLTN2LTQuOGMwLTEuMS0uMDItMi42LTEuNi0yLjZzLTEuOSAxLjItMS45IDIuNVYyM0gxNXoiIGZpbGw9IndoaXRlIi8+PC9zdmc+';
const ICON_TWITTER   = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiIgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIj48cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHJ4PSI0IiBmaWxsPSIjMDAwIi8+PHBhdGggZD0iTTIyLjUgOGgzbC02LjUgNy41IDcuNSA5LjVoLTUuOGwtNC43LTYtNS4zIDZINy41bDctOEw3IDhoNS45bDQuMiA1LjV6IiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==';

function buildSocialIconsRow(indent = ''): string {
  return `${indent}<tr>
${indent}  <td align="center" style="padding: 24px 40px 0 40px;">
${indent}    <p style="margin: 0 0 16px 0; font-size: 14px; color: #aaaaaa; font-family: 'Poppins', Helvetica, Arial, sans-serif;">
${indent}      Síguenos en redes
${indent}    </p>
${indent}    <table cellpadding="0" cellspacing="0" border="0">
${indent}      <tr>
${indent}        <td style="padding: 0 8px;">
${indent}          <a href="https://instagram.com/animacionesmia" target="_blank">
${indent}            <img src="${ICON_INSTAGRAM}" alt="Instagram" width="32" height="32" style="display:block;" />
${indent}          </a>
${indent}        </td>
${indent}        <td style="padding: 0 8px;">
${indent}          <a href="https://linkedin.com/company/animacionesmia" target="_blank">
${indent}            <img src="${ICON_LINKEDIN}" alt="LinkedIn" width="32" height="32" style="display:block;" />
${indent}          </a>
${indent}        </td>
${indent}        <td style="padding: 0 8px;">
${indent}          <a href="https://twitter.com/animacionesmia" target="_blank">
${indent}            <img src="${ICON_TWITTER}" alt="Twitter / X" width="32" height="32" style="display:block;" />
${indent}          </a>
${indent}        </td>
${indent}      </tr>
${indent}    </table>
${indent}  </td>
${indent}</tr>`;
}

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
  const socialBlock = showSocialIcons ? `\n          ${buildSocialIconsRow('          ')}\n` : '';

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
                <img src="${LOGO_HEADER}"
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
                <img src="${LOGO_FOOTER}"
                     alt="MIA" width="80" height="auto"
                     style="display:block; margin: 0 auto 16px auto;" />
              </a>
              <p style="margin:0 0 8px 0; font-size:12px; color:#aaaaaa; font-family:'Poppins',Helvetica,Arial,sans-serif;">
                © ${new Date().getFullYear()} MIA — Mujeres en la Industria de la Animación
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

// ─── Welcome member email ──────────────────────────────────────────────────────

const LEVEL_DISPLAY_NAMES: Record<string, string> = {
  'pleno-derecho': 'Socia de Pleno Derecho',
  'estudiante': 'Socia Estudiante',
  'colaborador': 'Colaborador',
};

export async function sendWelcomeMemberEmail(
  apiKey: string,
  memberEmail: string,
  firstName: string,
  membershipType: string,
  contactId: number,
  renewalDate: string,
  whatsappGroupUrl: string,
): Promise<void> {
  log('email.welcome_queued', { email: memberEmail, membershipType });

  const isColaborador = membershipType === 'colaborador';
  const levelName = LEVEL_DISPLAY_NAMES[membershipType] ?? membershipType;

  const [year, month, day] = renewalDate.split('-');
  const formattedRenewalDate = `${day}/${month}/${year}`;

  const greeting = isColaborador ? '¡Bienvenido' : '¡Bienvenida';
  const memberIdLabel = isColaborador ? 'Número de Colaborador' : 'Número de Socia';
  const subject = isColaborador
    ? '¡Bienvenido a MIA! Tu membresía como Colaborador está activa ✨'
    : '¡Bienvenida a MIA! Tu membresía como Socia está activa ✨';

  const whatsappSection = isColaborador ? '' : `
            <!-- WhatsApp community -->
            <tr>
              <td style="padding:0 40px 32px 40px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0"
                       style="background-color:#f8f9fa; border-radius:8px;">
                  <tr>
                    <td style="padding:24px;">
                      <p style="margin:0 0 8px 0; font-size:16px; font-weight:600; color:#1d1d1b; font-family:'Poppins',Helvetica,Arial,sans-serif;">
                        Únete a nuestra comunidad
                      </p>
                      <p style="margin:0 0 16px 0; font-size:14px; color:#555; line-height:1.6; font-family:'Poppins',Helvetica,Arial,sans-serif;">
                        Accede al grupo de WhatsApp exclusivo para socias de MIA y conéctate con el resto de la comunidad.
                      </p>
                      <a href="${whatsappGroupUrl}" target="_blank"
                         style="display:inline-block; background:#25D366; color:#ffffff; font-family:'Poppins',Helvetica,Arial,sans-serif;
                                font-size:14px; font-weight:600; text-decoration:none; padding:10px 24px; border-radius:6px;">
                        Unirse al grupo de WhatsApp
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>`;

  const manualSection = isColaborador ? '' : `
            <!-- Manual de socia -->
            <tr>
              <td style="padding:0 40px 32px 40px; font-size:14px; color:#555; line-height:1.6; font-family:'Poppins',Helvetica,Arial,sans-serif;">
                Recuerda que tienes disponible el
                <a href="https://drive.google.com/file/d/1UYt2aikhUCA2lnDhyiz3ZnleCSEmHUfl/view?usp=sharing"
                   style="color:#d8242e; text-decoration:none; font-weight:600;" target="_blank">manual de socia</a>
                con toda la información sobre los beneficios y recursos disponibles para ti.
              </td>
            </tr>`;

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bienvenida a MIA</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f4; font-family:'Poppins',Helvetica,Arial,sans-serif;">
  <center class="wrapper">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4; padding:24px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" border="0"
                 style="max-width:600px; width:100%; background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08);">

            <!-- Header -->
            <tr>
              <td style="background-color:#1d1d1b; padding:24px 40px; text-align:center;">
                <a href="https://animacionesmia.com" target="_blank">
                  <img src="${LOGO_HEADER}"
                       alt="MIA — Mujeres en la Industria de la Animación"
                       width="160" height="auto"
                       style="display:block; margin:0 auto;" />
                </a>
              </td>
            </tr>

            <!-- Greeting -->
            <tr>
              <td style="padding:40px 40px 8px 40px;">
                <h1 style="margin:0 0 16px 0; font-size:24px; font-weight:700; color:#1d1d1b; font-family:'Poppins',Helvetica,Arial,sans-serif;">
                  ${greeting}, ${escapeHtml(firstName)}!
                </h1>
                <p style="margin:0 0 16px 0; font-size:16px; color:#555; line-height:1.6; font-family:'Poppins',Helvetica,Arial,sans-serif;">
                  Estamos muy ilusionadas de tenerte en MIA. Tu membresía ya está activa y puedes acceder a todos los recursos y beneficios de la asociación.
                </p>
              </td>
            </tr>

            <!-- Member info table -->
            <tr>
              <td style="padding:24px 40px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0"
                       style="border-collapse:collapse; border:1px solid #f0f0f0; border-radius:6px; overflow:hidden;">
                  <tr style="background-color:#f8f9fa;">
                    <td style="padding:12px 16px; font-size:13px; font-weight:600; color:#555; font-family:'Poppins',Helvetica,Arial,sans-serif; border-bottom:1px solid #f0f0f0;">
                      ${escapeHtml(memberIdLabel)}
                    </td>
                    <td style="padding:12px 16px; font-size:13px; color:#333; font-family:'Poppins',Helvetica,Arial,sans-serif; border-bottom:1px solid #f0f0f0;">
                      ${contactId}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 16px; font-size:13px; font-weight:600; color:#555; font-family:'Poppins',Helvetica,Arial,sans-serif; border-bottom:1px solid #f0f0f0;">
                      Tipo de membresía
                    </td>
                    <td style="padding:12px 16px; font-size:13px; color:#333; font-family:'Poppins',Helvetica,Arial,sans-serif; border-bottom:1px solid #f0f0f0;">
                      ${escapeHtml(levelName)}
                    </td>
                  </tr>
                  <tr style="background-color:#f8f9fa;">
                    <td style="padding:12px 16px; font-size:13px; font-weight:600; color:#555; font-family:'Poppins',Helvetica,Arial,sans-serif; border-bottom:1px solid #f0f0f0;">
                      Próxima Renovación
                    </td>
                    <td style="padding:12px 16px; font-size:13px; color:#333; font-family:'Poppins',Helvetica,Arial,sans-serif; border-bottom:1px solid #f0f0f0;">
                      ${escapeHtml(formattedRenewalDate)}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 16px; font-size:13px; font-weight:600; color:#555; font-family:'Poppins',Helvetica,Arial,sans-serif;">
                      Email
                    </td>
                    <td style="padding:12px 16px; font-size:13px; color:#333; font-family:'Poppins',Helvetica,Arial,sans-serif;">
                      ${escapeHtml(memberEmail)}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Portal access -->
            <tr>
              <td style="padding:0 40px 32px 40px;">
                <p style="margin:0 0 20px 0; font-size:16px; color:#555; line-height:1.6; font-family:'Poppins',Helvetica,Arial,sans-serif;">
                  Puedes acceder al portal de socias en cualquier momento usando tu correo electrónico.
                  Solicita tu enlace de acceso aquí:
                </p>
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="center">
                      <a href="https://animacionesmia.com/portal" target="_blank"
                         style="display:inline-block; background:#d8242e; color:#ffffff; font-family:'Poppins',Helvetica,Arial,sans-serif;
                                font-size:16px; font-weight:600; text-decoration:none; padding:14px 40px; border-radius:6px;">
                        Acceder al portal
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            ${whatsappSection}
            ${manualSection}
            ${buildSocialIconsRow('            ')}

            <!-- Footer -->
            <tr>
              <td style="background-color:#1d1d1b; padding:24px 40px; text-align:center; margin-top:24px;">
                <a href="https://animacionesmia.com" target="_blank">
                  <img src="${LOGO_FOOTER}"
                       alt="MIA" width="80" height="auto"
                       style="display:block; margin:0 auto 16px auto;" />
                </a>
                <p style="margin:0 0 8px 0; font-size:12px; color:#aaaaaa; font-family:'Poppins',Helvetica,Arial,sans-serif;">
                  © ${new Date().getFullYear()} MIA — Mujeres en la Industria de la Animación
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
  </center>
</body>
</html>`;

  await sendEmail(apiKey, {
    from: 'noreply@animacionesmia.com',
    to: memberEmail,
    subject,
    html,
  });
  log('email.welcome_sent', { email: memberEmail, membershipType });
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

// Resend email utility — uses REST API directly (no npm package, better Workers compatibility)
import { log, logError } from './logger';

const RESEND_API = 'https://api.resend.com/emails';

// ─── Shared assets ─────────────────────────────────────────────────────────────

// Logo variants served from Cloudflare Pages (public/)
const LOGO_HEADER = 'https://animacionesmia.com/logo-main.png';
const LOGO_FOOTER = 'https://animacionesmia.com/mia-footer.png'; // white variant for dark backgrounds

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
    const err = new Error(`Resend API error ${res.status}: ${body}`);
    logError('email.send_failed', err, { status: res.status });
    throw err;
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
                <table cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td>
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

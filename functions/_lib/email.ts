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

function buildFooter(showUnsubscribe = true): string {
  const unsubscribeLine = showUnsubscribe ? `
              <p style="margin:0; font-size:12px; color:#666666; font-family:'Poppins',Helvetica,Arial,sans-serif;">
                ¿No quieres recibir estos emails?
                <a href="https://animacionesmia.com/portal" style="color:#aaaaaa; text-decoration:underline;">
                  Gestiona tus preferencias
                </a>
              </p>` : '';
  return `          <!-- Footer -->
          <tr>
            <td style="background-color:#1d1d1b; padding:24px 40px; text-align:center;">
              <a href="https://animacionesmia.com" target="_blank">
                <img src="${LOGO_FOOTER}"
                     alt="MIA" width="80" height="auto"
                     style="display:block; margin:0 auto 16px auto;" />
              </a>
              <p style="margin:0 0 8px 0; font-size:12px; color:#aaaaaa; font-family:'Poppins',Helvetica,Arial,sans-serif;">
                © ${new Date().getFullYear()} MIA — Mujeres en la Industria de la Animación
              </p>
              <p style="margin:0 0 8px 0; font-size:12px; font-family:'Poppins',Helvetica,Arial,sans-serif;">
                <a href="https://animacionesmia.com" style="color:#d8242e; text-decoration:none;">
                  Visitar sitio web
                </a>
              </p>${unsubscribeLine}
            </td>
          </tr>`;
}

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

function wrapInLayout(content: string, showSocialIcons: boolean, showUnsubscribe = true): string {
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
          ${buildFooter(showUnsubscribe)}

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
    html: wrapInLayout(content, false, false),
  });
}

// ─── Magic link email ─────────────────────────────────────────────────────────

export async function sendMagicLinkEmail(
  apiKey: string,
  memberEmail: string,
  magicLink: string,
  firstName = '',
): Promise<void> {
  const greeting = firstName ? `¡Hola, ${escapeHtml(firstName)}!` : '¡Hola!';
  const content = `
    <table style="margin: 0 auto; width: calc(100% - 80px);">
      <tr>
        <td style="padding: 40px 0 8px 0; font-size: 24px; font-weight: 700; color: #1d1d1b; font-family:'Poppins',Helvetica,Arial,sans-serif;">
          ${greeting}
        </td>
      </tr>
      <tr>
        <td style="padding: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #1d1d1b; font-family:'Poppins',Helvetica,Arial,sans-serif;">
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
          Este enlace se ha enviado a <strong style="color:#555;">${escapeHtml(memberEmail)}</strong>.<br>
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
    html: wrapInLayout(content, true, false),
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
  memberCode: string,
  renewalDate: string,
  whatsappGroupUrl: string,
): Promise<void> {
  log('email.welcome_queued', { email: memberEmail, membershipType });

  const isColaborador = membershipType === 'colaborador';
  const levelName = LEVEL_DISPLAY_NAMES[membershipType] ?? 'Membresía MIA';

  const dateParts = renewalDate?.split('-');
  const formattedRenewalDate = dateParts?.length === 3
    ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`
    : renewalDate ?? '';

  const displayName = firstName || (isColaborador ? 'colaborador' : 'socia');
  const greeting = isColaborador ? '¡Bienvenido' : '¡Bienvenida';
  const memberIdLabel = isColaborador ? 'Número de Colaborador' : 'Número de Socia';
  const subject = isColaborador
    ? '¡Bienvenido a MIA! Tu membresía como Colaborador está activa ✨'
    : '¡Bienvenida a MIA! Tu membresía como Socia está activa ✨';
  const memberCodeRow = memberCode
    ? `<tr style="background-color:#f8f9fa;">
                    <td style="padding:12px 16px; font-size:13px; font-weight:600; color:#555; font-family:'Poppins',Helvetica,Arial,sans-serif; border-bottom:1px solid #f0f0f0;">
                      ${escapeHtml(memberIdLabel)}
                    </td>
                    <td style="padding:12px 16px; font-size:13px; color:#333; font-family:'Poppins',Helvetica,Arial,sans-serif; border-bottom:1px solid #f0f0f0;">
                      ${escapeHtml(memberCode)}
                    </td>
                  </tr>`
    : '';

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
                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td align="center">
                            <a href="${escapeHtml(whatsappGroupUrl)}" target="_blank"
                               style="display:inline-block; background:#25D366; color:#ffffff; font-family:'Poppins',Helvetica,Arial,sans-serif;
                                      font-size:14px; font-weight:600; text-decoration:none; padding:10px 24px; border-radius:6px;">
                              Unirse al grupo de WhatsApp
                            </a>
                          </td>
                        </tr>
                      </table>
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
                  ${greeting}, ${escapeHtml(displayName)}!
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
                  ${memberCodeRow}
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

            ${buildFooter(false)}

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

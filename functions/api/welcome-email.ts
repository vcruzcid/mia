// Welcome Email Edge Function
// Sends welcome email with member handbook attachment

interface RequestBody {
  email: string;
  firstName: string;
  memberNumber: number;
  membershipType: string;
}

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { email, firstName, memberNumber, membershipType }: RequestBody = await request.json();

    if (!email || !firstName) {
      return new Response('Missing required fields', { status: 400 });
    }

    // Email configuration
    const emailConfig = {
      from: {
        email: 'bienvenida@mia-animation.com',
        name: 'MIA - Mujeres en la Industria de la Animación'
      },
      to: [{ email, name: firstName }],
      subject: `¡Bienvenida a MIA, ${firstName}! 🎬`,
      html: generateWelcomeHTML(firstName, memberNumber, membershipType),
      attachments: [
        {
          filename: 'Manual_Socia_MIA.pdf',
          content: await getMemberHandbookBase64(),
          type: 'application/pdf',
          disposition: 'attachment'
        }
      ]
    };

    // TODO: Replace with your email service (SendGrid, Resend, etc.)
    console.log('TODO: Send welcome email:', emailConfig);

    // For now, return success
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Welcome email queued successfully' 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Welcome email error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}

function generateWelcomeHTML(firstName: string, memberNumber: number, membershipType: string): string {
  const membershipNames = {
    'socia-pleno-derecho': 'Socia de Pleno Derecho',
    'estudiante': 'Socia Estudiante',
    'colaborador': 'Socio Colaborador'
  };

  const membershipName = membershipNames[membershipType as keyof typeof membershipNames] || membershipType;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #d8242e; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; }
        .footer { background: #333; color: white; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
        .logo { max-width: 200px; margin-bottom: 20px; }
        .member-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .cta-button { 
          display: inline-block; 
          background: #d8242e; 
          color: white; 
          padding: 12px 24px; 
          text-decoration: none; 
          border-radius: 5px; 
          margin: 10px 0; 
        }
        .attachment-info { 
          background: #e8f4f8; 
          padding: 15px; 
          border-left: 4px solid #d8242e; 
          margin: 20px 0; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>¡Bienvenida a MIA!</h1>
          <h2>Mujeres en la Industria de la Animación</h2>
        </div>
        
        <div class="content">
          <h3>¡Hola ${firstName}!</h3>
          
          <p>Es un placer darte la bienvenida a <strong>MIA - Mujeres en la Industria de la Animación</strong>, la asociación profesional que conecta, empodera y visibiliza a las mujeres en el sector de la animación en España.</p>
          
          <div class="member-info">
            <h4>🆔 Tu información de socia:</h4>
            <ul>
              <li><strong>Número de socia:</strong> ${memberNumber}</li>
              <li><strong>Tipo de membresía:</strong> ${membershipName}</li>
              <li><strong>Fecha de alta:</strong> ${new Date().toLocaleDateString('es-ES')}</li>
            </ul>
          </div>

          <h4>🚀 ¿Qué puedes hacer ahora?</h4>
          <ol>
            <li><strong>Accede a tu portal de socia:</strong> 
              <br><a href="${process.env.APP_URL || 'https://animacionesmia.com'}/portal" class="cta-button">Ir al Portal</a>
            </li>
            <li><strong>Completa tu perfil:</strong> Añade tu información profesional, foto de perfil y CV para aparecer en nuestro directorio de socias.</li>
            <li><strong>Únete a nuestras redes sociales:</strong> Síguenos en Instagram, LinkedIn y Twitter para estar al día de todas las novedades.</li>
          </ol>

          <div class="attachment-info">
            <h4>📚 Manual de Socia Adjunto</h4>
            <p>En el archivo PDF adjunto encontrarás:</p>
            <ul>
              <li>Información detallada sobre los beneficios de tu membresía</li>
              <li>Guía de uso del portal de socias</li>
              <li>Código de conducta y valores de la asociación</li>
              <li>Contactos importantes y canales de comunicación</li>
            </ul>
          </div>

          <h4>💬 ¿Necesitas ayuda?</h4>
          <p>Si tienes alguna pregunta o necesitas asistencia, no dudes en contactarnos:</p>
          <ul>
            <li><strong>Email:</strong> <a href="mailto:info@mia-animation.com">info@mia-animation.com</a></li>
            <li><strong>Portal de socia:</strong> Usa el sistema de soporte integrado</li>
          </ul>

          <p><strong>¡Bienvenida a la familia MIA!</strong> 🎬✨</p>
          <p>Juntas construimos una industria más diversa e inclusiva.</p>
        </div>
        
        <div class="footer">
          <p><strong>MIA - Mujeres en la Industria de la Animación</strong></p>
          <p>Asociación profesional sin ánimo de lucro</p>
          <p>
            <a href="https://instagram.com/mia_animation" style="color: white; margin: 0 10px;">Instagram</a>
            <a href="https://linkedin.com/company/mia-animation" style="color: white; margin: 0 10px;">LinkedIn</a>
            <a href="https://twitter.com/mia_animation" style="color: white; margin: 0 10px;">Twitter</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

async function getMemberHandbookBase64(): Promise<string> {
  // TODO: Implement member handbook retrieval
  // This should fetch the PDF from Supabase Storage and convert to base64
  
  console.log('TODO: Fetch member handbook PDF from Supabase Storage');
  
  // For now, return empty string
  // In production, this would:
  // 1. Fetch PDF from Supabase Storage bucket
  // 2. Convert to base64
  // 3. Return for email attachment
  
  return '';
}
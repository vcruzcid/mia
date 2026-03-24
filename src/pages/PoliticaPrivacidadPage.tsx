import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function PoliticaPrivacidadPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-3xl text-center text-gray-900">
            Política de Privacidad
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-lg max-w-none text-gray-700">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">1. Información del responsable</h2>
            <div className="space-y-2">
              <p><strong>Responsable:</strong> MIA - Mujeres en la Industria de la Animación</p>
              <p><strong>Email de contacto:</strong> <a href="mailto:hola@animacionesmia.com" className="text-red-600 hover:text-red-700 underline">hola@animacionesmia.com</a></p>
              <p><strong>Finalidad:</strong> Gestión de la asociación profesional y promoción de mujeres en la industria de la animación</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">2. Información que recopilamos</h2>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Información que nos proporcionas directamente:</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Datos de registro:</strong> Nombre, apellidos, correo electrónico, teléfono</li>
                <li><strong>Datos de membresía:</strong> Información profesional, biografía, trabajos</li>
                <li><strong>Datos de contacto:</strong> Mensajes enviados a través de formularios de contacto</li>
                <li><strong>Datos de pago:</strong> Información necesaria para procesar pagos de membresía</li>
              </ul>

              <h3 className="text-xl font-semibold mb-2 text-gray-900">Información que recopilamos automáticamente:</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Datos de navegación:</strong> Dirección IP, tipo de navegador, páginas visitadas</li>
                <li><strong>Protección anti-bots:</strong> Cloudflare Turnstile procesa datos de interacción para detectar bots (interés legítimo — seguridad del servicio)</li>
                <li><strong>Cookies:</strong> Como se describe en nuestra Política de Cookies</li>
                <li><strong>Analytics:</strong> Datos de Google Analytics 4 sobre el uso del sitio web, únicamente si aceptas las cookies de análisis</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">3. Cómo utilizamos tu información</h2>
            <div className="space-y-4">
              <p>Utilizamos la información recopilada para:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Gestionar tu membresía en la asociación</li>
                <li>Proporcionar servicios y contenido personalizado</li>
                <li>Procesar pagos y gestionar facturación</li>
                <li>Enviar comunicaciones relacionadas con la asociación</li>
                <li>Responder a tus consultas y solicitudes</li>
                <li>Mejorar nuestro sitio web y servicios</li>
                <li>Cumplir con obligaciones legales</li>
                <li>Enviar newsletters (solo con tu consentimiento)</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">4. Base legal para el tratamiento</h2>
            <div className="space-y-4">
              <p>Tratamos tus datos personales basándonos en:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Consentimiento:</strong> Para newsletters y comunicaciones de marketing</li>
                <li><strong>Ejecución de contrato:</strong> Para la gestión de membresía y servicios</li>
                <li><strong>Interés legítimo:</strong> Para mejorar nuestros servicios y seguridad del sitio</li>
                <li><strong>Obligación legal:</strong> Para cumplir con requisitos legales y fiscales</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">5. Compartir información</h2>
            <div className="space-y-4">
              <p>Podemos compartir tu información con:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Stripe:</strong> Procesamiento de pagos de membresía (PCI DSS certificado)</li>
                <li><strong>WildApricot:</strong> CRM de gestión de membresías y comunicaciones con socias</li>
                <li><strong>Cloudflare:</strong> Infraestructura web, protección anti-bots (Turnstile) y base de datos de códigos de socia — cubiertos por el{' '}
                  <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-700 underline">
                    Acuerdo de Procesamiento de Datos de Cloudflare
                  </a>
                </li>
                <li><strong>Resend:</strong> Envío de emails transaccionales (bienvenida, enlace mágico)</li>
                <li><strong>Google Analytics:</strong> Análisis anónimo del uso del sitio web, únicamente con tu consentimiento previo</li>
                <li><strong>Autoridades:</strong> Cuando sea requerido por ley</li>
              </ul>
              <p>
                <strong>No vendemos, alquilamos ni compartimos tu información personal con terceros para fines comerciales.</strong>
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">6. Transferencias internacionales</h2>
            <p className="mb-4">
              Algunos de nuestros proveedores de servicios pueden estar ubicados fuera del Espacio Económico Europeo (EEE).
              En estos casos, garantizamos que se implementen las salvaguardas adecuadas conforme al RGPD,
              como cláusulas contractuales estándar o decisiones de adecuación de la Comisión Europea.
            </p>
            <p>
              En particular, la base de datos de códigos de socia se aloja en <strong>Cloudflare D1</strong>, con réplica
              primaria en Europa Occidental. El tratamiento está cubierto por el{' '}
              <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-700 underline">
                Acuerdo de Procesamiento de Datos de Cloudflare
              </a>
              , que incluye las cláusulas contractuales estándar aprobadas por la Comisión Europea.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">7. Retención de datos</h2>
            <div className="space-y-4">
              <p>Conservamos tus datos personales durante:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Datos de membresía:</strong> Mientras seas miembro activo + 3 años para obligaciones fiscales</li>
                <li><strong>Datos de contacto:</strong> 2 años desde el último contacto</li>
                <li><strong>Datos de newsletter:</strong> Hasta que te des de baja</li>
                <li><strong>Cookies:</strong> Según se especifica en nuestra Política de Cookies</li>
                <li><strong>Datos de pagos:</strong> Según requisitos legales fiscales (hasta 6 años)</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">8. Tus derechos</h2>
            <div className="space-y-4">
              <p>Bajo el RGPD, tienes derecho a:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Acceso:</strong> Obtener una copia de tus datos personales</li>
                <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos</li>
                <li><strong>Supresión:</strong> Solicitar la eliminación de tus datos</li>
                <li><strong>Limitación:</strong> Restringir el tratamiento de tus datos</li>
                <li><strong>Portabilidad:</strong> Recibir tus datos en formato estructurado</li>
                <li><strong>Oposición:</strong> Oponerte al tratamiento de tus datos</li>
                <li><strong>Retirar consentimiento:</strong> En cualquier momento para tratamientos basados en consentimiento</li>
              </ul>
              <p>
                Para ejercer estos derechos, contáctanos en: <a href="mailto:hola@animacionesmia.com" className="text-red-600 hover:text-red-700 underline">hola@animacionesmia.com</a>
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">9. Seguridad</h2>
            <p>
              Implementamos medidas técnicas y organizativas apropiadas para proteger tus datos personales 
              contra el acceso no autorizado, alteración, divulgación o destrucción. Esto incluye:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
              <li>Cifrado de datos en tránsito y en reposo</li>
              <li>Acceso restringido a datos personales</li>
              <li>Monitoreo regular de sistemas de seguridad</li>
              <li>Formación del personal en protección de datos</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">10. Menores de edad</h2>
            <p>
              Nuestros servicios no están dirigidos a menores de 16 años. No recopilamos conscientemente 
              información personal de menores de 16 años. Si descubrimos que hemos recopilado información 
              de un menor de 16 años, eliminaremos dicha información inmediatamente.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">11. Cambios en esta política</h2>
            <p>
              Podemos actualizar esta política de privacidad ocasionalmente. Te notificaremos sobre 
              cambios significativos publicando la nueva política en nuestro sitio web y enviando 
              un aviso por correo electrónico si tienes una cuenta con nosotros.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">12. Reclamaciones</h2>
            <p>
              Si consideras que el tratamiento de tus datos personales infringe la normativa vigente, 
              tienes derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD):
            </p>
            <div className="mt-4 space-y-2">
              <p><strong>Web:</strong> <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-700 underline">www.aepd.es</a></p>
              <p><strong>Teléfono:</strong> 901 100 099</p>
              <p><strong>Dirección:</strong> C/ Jorge Juan, 6, 28001 Madrid</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">13. Contacto</h2>
            <p>
              Para cualquier consulta relacionada con esta política de privacidad o el tratamiento 
              de tus datos personales, puedes contactarnos en:
            </p>
            <p className="mt-2">
              <strong>Email:</strong> <a href="mailto:hola@animacionesmia.com" className="text-red-600 hover:text-red-700 underline">hola@animacionesmia.com</a>
            </p>
          </section>

          <div className="mt-12 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Última actualización:</strong> Marzo 2026
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function PoliticaCookiesPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-3xl text-center text-gray-900">
            Política de Cookies
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-lg max-w-none text-gray-700">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">¿Qué son las cookies?</h2>
            <p>
              Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas nuestro sitio web. 
              Estas cookies nos ayudan a mejorar tu experiencia de navegación y nos permiten analizar cómo utilizas nuestro sitio.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Tipos de cookies que utilizamos</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Cookies Necesarias</h3>
                <p>
                  Estas cookies son esenciales para el funcionamiento básico del sitio web y no se pueden desactivar. 
                  Incluyen cookies de autenticación, seguridad y preferencias básicas del sitio.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Cookies de Rendimiento</h3>
                <p>
                  Estas cookies nos ayudan a entender cómo los visitantes interactúan con nuestro sitio web, 
                  proporcionándonos información sobre las páginas más visitadas y los errores que puedan ocurrir.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Cookies Analíticas</h3>
                <p>
                  Utilizamos Google Analytics para recopilar información sobre cómo los usuarios utilizan nuestro sitio. 
                  Esta información se utiliza para mejorar nuestro sitio web y servicios.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Cookies de Preferencias</h3>
                <p>
                  Estas cookies permiten al sitio web recordar información que cambia la forma en que se comporta 
                  o el aspecto del mismo, como tu idioma preferido o la región en la que te encuentras.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Cookies de Funcionalidad</h3>
                <p>
                  Estas cookies permiten al sitio web proporcionar una funcionalidad y personalización mejoradas, 
                  como recordar tu información de inicio de sesión y preferencias de formulario.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Cookies de Terceros</h3>
                <p>
                  Nuestro sitio puede utilizar cookies de terceros, como las de redes sociales (Facebook, Twitter, Instagram, LinkedIn), 
                  servicios de pago (Stripe) y otras integraciones externas.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Cookies Publicitarias</h3>
                <p>
                  Estas cookies se utilizan para hacer que los mensajes publicitarios sean más relevantes para ti. 
                  Realizan funciones como evitar que el mismo anuncio aparezca continuamente.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Cookies específicas que utilizamos</h2>
            <div className="space-y-4">
              <p><strong>Cookies necesarias:</strong> tl_7112_7112_10</p>
              <p><strong>Cookies de preferencias:</strong> prism_798869211, gh_sess, aka_debug, test_cookie</p>
              <p><strong>Cookies analíticas:</strong> vuid, GPS, _cfduid, _hjid, _hjIncludedInSample, has_recent_activity, tk_or, tk_r3d, _ga, _gid, gat_gtag</p>
              <p><strong>Cookies publicitarias:</strong> IDE</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Cómo gestionar las cookies</h2>
            <p className="mb-4">
              Puedes controlar y/o eliminar las cookies como desees. Para obtener más información, consulta 
              <a href="https://www.aboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-700 underline">
                aboutcookies.org
              </a>. 
              Puedes eliminar todas las cookies que ya están en tu dispositivo y configurar la mayoría de los navegadores 
              para que no se coloquen.
            </p>
            <p>
              Sin embargo, si haces esto, es posible que tengas que ajustar manualmente algunas preferencias cada vez 
              que visites un sitio y que algunos servicios y funcionalidades no funcionen correctamente.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Cumplimiento del RGPD</h2>
            <p>
              Cumplimos con el Reglamento General de Protección de Datos (RGPD) de la Unión Europea. 
              Utilizamos detección geoIP para determinar tu ubicación y aplicar las regulaciones correspondientes. 
              Tu consentimiento se registra y mantiene según los requisitos legales.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Contacto</h2>
            <p>
              Si tienes alguna pregunta sobre nuestra política de cookies, puedes contactarnos en:
            </p>
            <p className="mt-2">
              <strong>Email:</strong> <a href="mailto:hola@animacionesmia.com" className="text-red-600 hover:text-red-700 underline">hola@animacionesmia.com</a>
            </p>
          </section>

          <div className="mt-12 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Última actualización:</strong> Enero 2025
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
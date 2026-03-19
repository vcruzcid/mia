import * as CookieConsent from 'vanilla-cookieconsent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
              Estas cookies nos ayudan a garantizar el correcto funcionamiento de la web y, con tu consentimiento, a analizar cómo la utilizas.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Categorías de cookies que utilizamos</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Necesarias</h3>
                <p>
                  Imprescindibles para el funcionamiento básico del sitio. No se pueden desactivar.
                  Incluyen la protección anti-bots de <strong>Cloudflare Turnstile</strong>, cuyo uso se ampara en
                  el interés legítimo de la seguridad del servicio, y las cookies de sesión del portal de socias.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Funcionales</h3>
                <p>
                  Permiten recordar tus preferencias y mantener tu sesión activa en el portal de socias.
                  Solo se activan si las aceptas.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Análisis</h3>
                <p>
                  Utilizamos <strong>Google Analytics 4</strong> para entender cómo se utiliza el sitio web.
                  Estos datos son anónimos y se usan únicamente para mejorar nuestros contenidos y servicios.
                  Solo se activan con tu consentimiento expreso.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Cookies específicas de análisis</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-left">Cookie</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Proveedor</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Duración</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Finalidad</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2">_ga</td>
                    <td className="border border-gray-300 px-3 py-2">Google Analytics</td>
                    <td className="border border-gray-300 px-3 py-2">2 años</td>
                    <td className="border border-gray-300 px-3 py-2">Identifica usuarios únicos</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2">_ga_*</td>
                    <td className="border border-gray-300 px-3 py-2">Google Analytics</td>
                    <td className="border border-gray-300 px-3 py-2">2 años</td>
                    <td className="border border-gray-300 px-3 py-2">Almacena el estado de sesión</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2">_gid</td>
                    <td className="border border-gray-300 px-3 py-2">Google Analytics</td>
                    <td className="border border-gray-300 px-3 py-2">24 horas</td>
                    <td className="border border-gray-300 px-3 py-2">Distingue usuarios en la sesión</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Gestionar tus preferencias</h2>
            <p className="mb-4">
              Puedes revisar y modificar tus preferencias de cookies en cualquier momento.
              Las cookies de análisis se eliminarán automáticamente si retiras tu consentimiento.
            </p>
            <Button
              onClick={() => CookieConsent.showPreferences()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Gestionar preferencias de cookies
            </Button>
            <p className="mt-4">
              También puedes eliminar las cookies desde la configuración de tu navegador.
              Ten en cuenta que deshabilitar cookies necesarias puede afectar al funcionamiento del sitio.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Cumplimiento del RGPD</h2>
            <p>
              Cumplimos con el Reglamento General de Protección de Datos (RGPD) y la Ley Orgánica de Protección de Datos
              y Garantía de los Derechos Digitales (LOPDGDD). Tu consentimiento se registra con fecha, versión de la política
              y categorías aceptadas. Puedes retirarlo en cualquier momento sin que ello afecte a la licitud del tratamiento previo.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Contacto</h2>
            <p>
              Si tienes alguna pregunta sobre nuestra política de cookies, puedes contactarnos en:
            </p>
            <p className="mt-2">
              <strong>Email:</strong>{' '}
              <a href="mailto:hola@animacionesmia.com" className="text-red-600 hover:text-red-700 underline">
                hola@animacionesmia.com
              </a>
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

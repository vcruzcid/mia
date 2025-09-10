import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function TerminosUsoPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-3xl text-center text-gray-900">
            Términos de Uso
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-lg max-w-none text-gray-700">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">1. Aceptación de los términos</h2>
            <p>
              Al acceder y utilizar el sitio web de MIA - Mujeres en la Industria de la Animación, 
              aceptas estar vinculado por estos términos de uso. Si no estás de acuerdo con alguno 
              de estos términos, no debes utilizar este sitio web.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">2. Descripción del servicio</h2>
            <p>
              MIA es una asociación profesional que tiene como objetivo promover y apoyar a las mujeres 
              en la industria de la animación en España. Nuestro sitio web proporciona información sobre 
              la asociación, eventos, oportunidades de membresía y recursos para profesionales de la animación.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">3. Registro y membresía</h2>
            <div className="space-y-4">
              <p>
                Para acceder a ciertas funciones del sitio web, es posible que debas registrarte como miembro. 
                Al registrarte, aceptas:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Proporcionar información precisa, actualizada y completa sobre ti</li>
                <li>Mantener la seguridad de tu contraseña y cuenta</li>
                <li>Notificarnos inmediatamente sobre cualquier uso no autorizado de tu cuenta</li>
                <li>Aceptar la responsabilidad de todas las actividades que ocurran bajo tu cuenta</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">4. Uso aceptable</h2>
            <div className="space-y-4">
              <p>Al utilizar nuestro sitio web, te comprometes a:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Utilizar el sitio web solo para fines legales y autorizados</li>
                <li>No interferir con la seguridad del sitio web</li>
                <li>No utilizar el sitio web para transmitir contenido ofensivo, amenazante o difamatorio</li>
                <li>Respetar los derechos de propiedad intelectual de terceros</li>
                <li>No intentar obtener acceso no autorizado a cualquier parte del sitio web</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">5. Propiedad intelectual</h2>
            <p>
              Todo el contenido del sitio web, incluyendo pero no limitándose a textos, gráficos, logos, 
              iconos, imágenes, clips de audio, descargas digitales, compilaciones de datos y software, 
              es propiedad de MIA o de sus proveedores de contenido y está protegido por las leyes de 
              derechos de autor españolas e internacionales.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">6. Contenido generado por usuarios</h2>
            <div className="space-y-4">
              <p>
                Si envías contenido a nuestro sitio web (comentarios, trabajos, etc.), garantizas que:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Tienes derecho a enviar dicho contenido</li>
                <li>El contenido no infringe los derechos de terceros</li>
                <li>El contenido es preciso y no es engañoso</li>
                <li>El contenido no es ofensivo, difamatorio o inapropiado</li>
              </ul>
              <p>
                Al enviar contenido, nos otorgas una licencia no exclusiva, libre de regalías, 
                perpetua e irrevocable para usar, reproducir, modificar, adaptar, publicar, 
                traducir y distribuir dicho contenido.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">7. Limitación de responsabilidad</h2>
            <p>
              MIA no será responsable de ningún daño directo, indirecto, incidental, especial, 
              consecuente o punitivo que resulte del uso o la imposibilidad de usar el sitio web, 
              incluso si MIA ha sido advertida de la posibilidad de tales daños.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">8. Privacidad</h2>
            <p>
              Tu privacidad es importante para nosotros. Por favor, revisa nuestra Política de Privacidad, 
              que también rige tu uso del sitio web, para entender nuestras prácticas de recopilación 
              y uso de información.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">9. Modificaciones</h2>
            <p>
              MIA se reserva el derecho de modificar estos términos de uso en cualquier momento. 
              Las modificaciones entrarán en vigor inmediatamente después de su publicación en el sitio web. 
              Tu uso continuado del sitio web después de dichas modificaciones constituirá tu aceptación 
              de los nuevos términos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">10. Terminación</h2>
            <p>
              MIA puede terminar o suspender tu acceso al sitio web inmediatamente, sin previo aviso 
              o responsabilidad, por cualquier motivo, incluyendo sin limitación si incumples los términos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">11. Ley aplicable</h2>
            <p>
              Estos términos se regirán e interpretarán de acuerdo con las leyes de España, 
              sin tener en cuenta los principios de conflicto de leyes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">12. Contacto</h2>
            <p>
              Si tienes alguna pregunta sobre estos términos de uso, puedes contactarnos en:
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
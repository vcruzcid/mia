import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BackgroundImage } from '@/components/ui/background-image';
import { CheckCircle2, Mail, LogIn, Home } from 'lucide-react';

/**
 * ConfirmacionPage - Registration Success Confirmation
 *
 * Shown after successful payment in Wildapricot widget.
 * User is redirected here from Wildapricot after completing payment.
 *
 * Displays:
 * - Success message in Spanish
 * - Next steps (check email, access portal)
 * - Link to Wildapricot member portal
 * - CTA to return home
 */
export function ConfirmacionPage() {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <BackgroundImage
        imageUrl="/images/home-cta.webp"
        className="w-full py-16 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500 rounded-full mb-6">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            ¡Bienvenida a MIA!
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto">
            Tu registro se ha completado exitosamente
          </p>
        </div>
      </BackgroundImage>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="shadow-xl">
          <CardContent className="p-8">
            <div className="space-y-8">
              {/* Success Message */}
              <div className="text-center">
                <p className="text-lg text-gray-700 mb-4">
                  ¡Gracias por unirte a la comunidad de Mujeres en la Industria de Animación!
                </p>
                <p className="text-gray-600">
                  Tu membresía ha sido activada y ya formas parte de nuestra red profesional.
                </p>
              </div>

              {/* Next Steps */}
              <div className="border-t border-gray-200 pt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  Próximos pasos
                </h2>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Step 1: Check Email */}
                  <div className="flex items-start p-6 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-full">
                        <Mail className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        1. Revisa tu correo
                      </h3>
                      <p className="text-sm text-gray-700">
                        Recibirás un email con tus credenciales de acceso al portal de socias y la confirmación de tu membresía.
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Access Portal */}
                  <div className="flex items-start p-6 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-full">
                        <LogIn className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        2. Accede al portal
                      </h3>
                      <p className="text-sm text-gray-700">
                        Usa las credenciales recibidas para acceder al portal de socias y completar tu perfil.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Portal Access Button */}
              <div className="border-t border-gray-200 pt-8">
                <div className="text-center">
                  <p className="text-gray-700 mb-4">
                    Accede al portal de socias de MIA:
                  </p>
                  <a
                    href="https://web.animacionesmia.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors duration-200"
                  >
                    <LogIn className="w-5 h-5 mr-2" />
                    Portal de Socias
                  </a>                </div>
              </div>

              {/* What's Next Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  ¿Qué puedo hacer ahora?
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-red-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Completa tu perfil profesional en el portal</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-red-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Explora los eventos y formaciones disponibles</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-red-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Conecta con otras socias en la comunidad</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-red-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Participa en los grupos de trabajo y comisiones</span>
                  </li>
                </ul>
              </div>

              {/* Return Home Button */}
              <div className="text-center pt-4">
                <Link to="/">
                  <Button
                    variant="outline"
                    className="inline-flex items-center"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Volver al inicio
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-300 text-sm mb-2">
            ¿Necesitas ayuda?
          </p>
          <p className="text-gray-400 text-sm">
            Contáctanos en{' '}
            <a href="mailto:hola@animacionesmia.com" className="text-red-400 hover:text-red-300 underline">
              hola@animacionesmia.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

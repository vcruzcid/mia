import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { TurnstileWidget } from '../components/TurnstileWidget';
import { Card, CardContent } from '@/components/ui/card';
import { BackgroundImage } from '@/components/ui/background-image';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

/**
 * RegistroPage - Member Registration with Wildapricot Widget
 *
 * Two-step process:
 * 1. User completes Turnstile CAPTCHA verification (bot protection)
 * 2. Wildapricot registration widget loads (handles form + payment + membership)
 *
 * Handles:
 * - Turnstile verification before widget loads
 * - Payment cancellation messages via ?cancelado=true query param
 * - Responsive iframe embedding
 * - Spanish UI text
 */
export function RegistroPage() {
  const [verified, setVerified] = useState(false);
  const [verificationError, setVerificationError] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const location = useLocation();

  // Check if user canceled payment
  const isCanceled = new URLSearchParams(location.search).get('cancelado') === 'true';

  // Handle Turnstile verification
  const handleVerify = (token: string) => {
    console.log('Turnstile verified:', token);
    setVerified(true);
    setVerificationError(false);
  };

  const handleError = () => {
    console.error('Turnstile verification error');
    setVerificationError(true);
  };

  const handleExpire = () => {
    console.warn('Turnstile verification expired');
    setVerified(false);
  };

  // Handle iframe load event
  const handleIframeLoad = () => {
    setIframeLoading(false);
  };

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
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            Únete a MIA
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
            Completa el formulario para hacerte socia de la comunidad de mujeres en la industria de animación
          </p>
        </div>
      </BackgroundImage>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Payment Canceled Message */}
        {isCanceled && (
          <Card className="mb-8 border-yellow-500 bg-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-start">
                <AlertCircle className="h-6 w-6 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                    Pago cancelado
                  </h3>
                  <p className="text-yellow-800">
                    El proceso de pago fue cancelado. Puedes intentarlo de nuevo completando el formulario a continuación.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-xl">
          <CardContent className="p-8">
            {!verified ? (
              /* Step 1: Turnstile Verification */
              <div className="space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                    <svg
                      className="w-8 h-8 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Verificación de seguridad
                  </h2>
                  <p className="text-gray-600 mb-8">
                    Por favor, completa la verificación para continuar con tu registro
                  </p>
                </div>

                {/* Turnstile Widget */}
                <div className="flex justify-center">
                  <TurnstileWidget
                    onVerify={handleVerify}
                    onError={handleError}
                    onExpire={handleExpire}
                  />
                </div>

                {/* Verification Error */}
                {verificationError && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-800">
                        Error al cargar la verificación. Por favor, recarga la página e inténtalo de nuevo.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Step 2: Wildapricot Widget */
              <div className="space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Verificación completada
                  </h2>
                  <p className="text-gray-600 mb-8">
                    Completa el formulario a continuación para unirte a MIA
                  </p>
                </div>

                {/* Loading State */}
                {iframeLoading && (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                    <p className="mt-4 text-gray-600">Cargando formulario...</p>
                  </div>
                )}

                {/* Wildapricot Widget Iframe */}
                <div className={`${iframeLoading ? 'h-0 overflow-hidden' : ''}`}>
                  <iframe
                    width="100%"
                    height="1200"
                    frameBorder="0"
                    src="https://mia.wildapricot.com/widget/join"
                    onLoad={handleIframeLoad}
                    className="w-full min-h-[1200px] border-0"
                    title="Formulario de registro de MIA"
                    // iOS scrollability
                    scrolling="yes"
                    style={{
                      WebkitOverflowScrolling: 'touch',
                    }}
                  />
                </div>

                {/* Info Box */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>Nota:</strong> Después de completar el pago, recibirás un correo electrónico con tus credenciales de acceso al portal de socias.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-300 text-sm">
            ¿Tienes dudas?{' '}
            <a href="/contacto" className="text-red-400 hover:text-red-300 underline">
              Contáctanos
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

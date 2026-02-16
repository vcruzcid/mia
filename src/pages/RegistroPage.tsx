import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { BackgroundImage } from '@/components/ui/background-image';
import { AlertCircle } from 'lucide-react';

/**
 * RegistroPage - Member Registration with Wildapricot Widget
 *
 * Simple direct embedding of Wildapricot registration widget.
 * Wildapricot handles: form, payment (via Stripe), bot protection (reCAPTCHA),
 * contact creation, membership creation, and welcome emails.
 *
 * Handles:
 * - Direct widget iframe embedding
 * - Payment cancellation messages via ?cancelado=true query param
 * - Responsive iframe embedding
 * - Spanish UI text
 */
export function RegistroPage() {
  const [iframeLoading, setIframeLoading] = useState(true);
  const location = useLocation();

  // Check if user canceled payment
  const isCanceled = new URLSearchParams(location.search).get('cancelado') === 'true';

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
            <div className="space-y-6">
              {/* Loading State */}
              {iframeLoading && (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                  <p className="mt-4 text-gray-600">Cargando formulario de registro...</p>
                </div>
              )}

              {/* Wildapricot Widget Iframe */}
              <div className={`${iframeLoading ? 'h-0 overflow-hidden' : ''} relative`}>
                <iframe
                  width="100%"
                  height="1200"
                  frameBorder="0"
                  src="https://web.animacionesmia.com/widget/join"
                  onLoad={handleIframeLoad}
                  className="w-full min-h-[1200px] border-0 rounded-md"
                  title="Formulario de registro de MIA"
                  // iOS scrollability
                  scrolling="yes"
                  allow="payment"
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

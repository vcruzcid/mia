import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';

export function RegistroExitoPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="max-w-lg w-full text-center">
          {/* Success icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            ¡Bienvenida a MIA!
          </h1>

          <p className="text-lg text-gray-700 mb-2">
            Tu suscripción ha sido procesada correctamente.
          </p>

          <p className="text-gray-600 mb-8">
            En breve recibirás un email de confirmación con los detalles de tu membresía.
            Si tienes alguna duda, escríbenos a{' '}
            <a href="mailto:info@animacionesmia.com" className="text-red-600 hover:text-red-700 underline">
              info@animacionesmia.com
            </a>.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-8 text-left">
            <h2 className="text-sm font-semibold text-blue-900 mb-3">¿Qué pasa ahora?</h2>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5">1.</span>
                <span>Recibirás un email de bienvenida de MIA con tu acceso.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5">2.</span>
                <span>Tu perfil aparecerá en el directorio de socias una vez lo completes.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5">3.</span>
                <span>Tu suscripción se renovará automáticamente cada año. Puedes cancelarla cuando quieras.</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link to="/">Ir a la página principal</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/socias">Ver el directorio de socias</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

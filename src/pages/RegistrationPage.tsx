import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { membershipTypes } from '@/utils/memberships';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Spinner } from '@/components/ui/spinner';

interface RegistrationState {
  selectedMembership: string | null;
  isProcessing: boolean;
  error: string | null;
}

export function RegistrationPage() {
  const location = useLocation();
  const [state, setState] = useState<RegistrationState>({
    selectedMembership: null,
    isProcessing: false,
    error: null,
  });

  const [showTerms, setShowTerms] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [gdprAccepted, setGdprAccepted] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  // Handle pre-selected membership from navigation state
  useEffect(() => {
    if (location.state?.selectedMembership && !state.selectedMembership) {
      setState(prev => ({
        ...prev,
        selectedMembership: location.state.selectedMembership,
      }));
    }
  }, [location.state, state.selectedMembership]);

  const selectedMembership = membershipTypes.find(m => m.id === state.selectedMembership);

  const canProceed = () => {
    return !!state.selectedMembership && termsAccepted && gdprAccepted;
  };

  const handlePayment = async () => {
    if (!selectedMembership) return;

    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ membershipType: selectedMembership.id }),
      });

      const data = await res.json() as { success: boolean; url?: string; error?: string };

      if (!data.success || !data.url) {
        throw new Error(data.error ?? 'Error al crear la sesión de pago');
      }

      window.location.href = data.url;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Error al procesar el pago',
      }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Únete a MIA
            </h1>
            <p className="text-xl text-gray-800 max-w-2xl mx-auto">
              Selecciona tu tipo de membresía y procede al pago.
              Completarás tu perfil después del proceso de pago.
            </p>
          </div>

          {/* Process steps */}
          <div className="mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-blue-900 mb-4 text-center">
                Proceso de Registro
              </h3>
              <div className="grid md:grid-cols-3 gap-6 text-sm text-blue-800">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                    1
                  </div>
                  <p><strong>Selecciona</strong><br />Elige tu tipo de membresía</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                    2
                  </div>
                  <p><strong>Paga</strong><br />Completa el pago seguro con Stripe</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                    3
                  </div>
                  <p><strong>Actívate</strong><br />Tu cuenta MIA queda activada automáticamente</p>
                </div>
              </div>
            </div>
          </div>

          <Card className="bg-white overflow-hidden">
            <CardContent className="p-8">
              {/* Security banner */}
              <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex">
                  <svg className="h-5 w-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Pago 100% Seguro</h3>
                    <p className="mt-1 text-sm text-green-700">
                      Procesado por Stripe con encriptación SSL. No guardamos información de tarjetas de crédito.
                      Cumplimos con RGPD y estándares PCI DSS.
                    </p>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
                Selecciona tu Membresía
              </h2>

              {/* Membership cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {membershipTypes.map((membership) => (
                  <Card
                    key={membership.id}
                    className={`relative cursor-pointer transition-all duration-200 border-2 ${
                      state.selectedMembership === membership.id
                        ? 'border-red-600 ring-2 ring-red-600 ring-opacity-50 transform scale-105'
                        : 'border-gray-200 hover:border-red-600 hover:shadow-md'
                    }`}
                    onClick={() => setState(prev => ({ ...prev, selectedMembership: membership.id }))}
                  >
                    <CardContent className="p-6">
                      <div className="text-center">
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                          {membership.name}
                        </h3>
                        <p className="text-sm text-gray-800 mb-4 min-h-[3rem] flex items-center justify-center">
                          {membership.description}
                        </p>
                        <div className="flex items-baseline justify-center">
                          <span className="text-3xl font-bold text-gray-900">€{membership.price}</span>
                          <span className="text-base text-gray-700 ml-1">/ año</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pricing summary */}
              {selectedMembership && (
                <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Resumen de Pago</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-800">Membresía {selectedMembership.name}:</span>
                      <span className="font-medium">€{selectedMembership.price}</span>
                    </div>
                    <hr className="border-gray-300" />
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total:</span>
                      <span className="text-red-600">€{selectedMembership.price} / año</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-2">
                      Suscripción anual. Se renueva automáticamente cada año. Puedes cancelar en cualquier momento.
                    </p>
                  </div>
                </div>
              )}

              {/* Terms and Conditions */}
              <div className="space-y-4 mb-8 p-6 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900">Términos y Condiciones</h3>

                <label className="flex items-start space-x-3">
                  <Checkbox
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                  />
                  <span className="text-sm text-gray-700">
                    Acepto los{' '}
                    <a href="/terminos-uso" target="_blank" className="text-primary-600 hover:text-primary-700 font-medium underline">
                      términos y condiciones
                    </a>{' '}
                    de uso de la plataforma *
                  </span>
                </label>

                <label className="flex items-start space-x-3">
                  <Checkbox
                    checked={gdprAccepted}
                    onCheckedChange={(checked) => setGdprAccepted(checked as boolean)}
                  />
                  <span className="text-sm text-gray-700">
                    Acepto el{' '}
                    <Button
                      type="button"
                      onClick={() => setShowTerms(!showTerms)}
                      variant="link"
                      className="text-primary-600 hover:text-primary-700 font-medium underline p-0 h-auto"
                    >
                      tratamiento de mis datos personales
                    </Button>{' '}
                    según la política de privacidad *
                  </span>
                </label>

                {showTerms && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-sm text-blue-800">
                    <h4 className="font-semibold mb-2">Información sobre el tratamiento de datos</h4>
                    <ul className="space-y-2 text-xs">
                      <li><strong>Responsable:</strong> Mujeres en la Industria de Animación (MIA)</li>
                      <li><strong>Finalidad:</strong> Gestión de la membresía, comunicaciones y servicios</li>
                      <li><strong>Recolección:</strong> Los datos se recogerán durante el proceso de pago seguro</li>
                      <li><strong>Base legal:</strong> Consentimiento del interesado y ejecución contractual</li>
                      <li><strong>Destinatarios:</strong> Stripe (procesador de pagos) y MIA</li>
                      <li><strong>Derechos:</strong> Acceso, rectificación, supresión, limitación, portabilidad y oposición</li>
                      <li><strong>Conservación:</strong> Durante la vigencia de la membresía y 5 años adicionales</li>
                    </ul>
                    <p className="mt-2">
                      Para más información, consulta nuestra{' '}
                      <a href="/politica-privacidad" className="underline font-medium">política de privacidad completa</a>.
                    </p>
                  </div>
                )}
              </div>

              {/* Error */}
              {state.error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <svg className="h-5 w-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error en el proceso de pago</h3>
                      <p className="mt-1 text-sm text-red-700">{state.error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* CTA */}
              <Button
                type="button"
                onClick={handlePayment}
                disabled={!canProceed() || state.isProcessing}
                className="w-full py-3 text-lg font-medium"
                size="lg"
              >
                {state.isProcessing ? (
                  <>
                    <Spinner className="h-5 w-5 mr-3" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Proceder al Pago — €{selectedMembership?.price ?? 0} / año
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

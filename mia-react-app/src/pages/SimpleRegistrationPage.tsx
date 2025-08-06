import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { membershipTypes } from '../utils/memberships';
import { VALID_DISCOUNT_CODES, calculateDiscountedPrice } from '../schemas/registrationSchema';
import { siteConfig } from '../config/site.config';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface RegistrationState {
  selectedMembership: string | null;
  discountCode: string;
  isProcessing: boolean;
  error: string | null;
  successMessage: string | null;
}

export function SimpleRegistrationPage() {
  const location = useLocation();
  const [state, setState] = useState<RegistrationState>({
    selectedMembership: null,
    discountCode: '',
    isProcessing: false,
    error: null,
    successMessage: null,
  });

  const [discountInput, setDiscountInput] = useState('');
  const [discountError, setDiscountError] = useState('');
  const [showTerms, setShowTerms] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [gdprAccepted, setGdprAccepted] = useState(false);

  // Handle pre-selected membership from navigation state
  useEffect(() => {
    if (location.state?.selectedMembership && !state.selectedMembership) {
      setState(prev => ({ 
        ...prev, 
        selectedMembership: location.state.selectedMembership 
      }));
    }
  }, [location.state, state.selectedMembership]);

  // Clear success message when membership selection changes
  useEffect(() => {
    if (state.successMessage && state.selectedMembership) {
      setState(prev => ({ ...prev, successMessage: null }));
    }
  }, [state.selectedMembership, state.successMessage]);

  const selectedMembership = membershipTypes.find(m => m.id === state.selectedMembership);
  const isPaidMembership = selectedMembership && selectedMembership.price > 0;

  // Calculate pricing with discount
  const pricingInfo = selectedMembership 
    ? calculateDiscountedPrice(selectedMembership.price, state.discountCode)
    : null;

  const applyDiscountCode = () => {
    const code = discountInput.trim().toUpperCase();
    
    if (!code) {
      setState(prev => ({ ...prev, discountCode: '' }));
      setDiscountError('');
      return;
    }

    if (VALID_DISCOUNT_CODES[code as keyof typeof VALID_DISCOUNT_CODES]) {
      setState(prev => ({ ...prev, discountCode: code }));
      setDiscountError('');
    } else {
      setDiscountError('Código de descuento no válido');
    }
  };

  const removeDiscountCode = () => {
    setState(prev => ({ ...prev, discountCode: '' }));
    setDiscountInput('');
    setDiscountError('');
  };

  const handlePayment = async () => {
    if (!selectedMembership) return;
    
    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      if (selectedMembership.id === 'newsletter') {
        // For newsletter, redirect to simple Stripe Checkout for email collection
        await handleNewsletterSignup();
      } else {
        // For paid memberships, redirect to Stripe Checkout
        await handlePaidMembershipCheckout();
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Error procesando el pago',
      }));
    }
  };

  const handleNewsletterSignup = async () => {
    // For newsletter, we still need to collect email
    // Option 1: Use Stripe Checkout with 0 amount to collect email
    // Option 2: Show a simple email form
    
    // Using Stripe Checkout for consistency
    const checkoutData = {
      membershipType: 'newsletter',
      amount: 0,
      discountCode: state.discountCode,
      collectShipping: false, // Newsletter doesn't need address
      mode: 'setup', // Just collect customer info
    };

    await redirectToStripeCheckout(checkoutData);
  };

  const handlePaidMembershipCheckout = async () => {
    if (!selectedMembership || !pricingInfo) return;

    const checkoutData = {
      membershipType: selectedMembership.id,
      amount: pricingInfo.finalPrice,
      originalAmount: pricingInfo.originalPrice,
      discountCode: state.discountCode,
      discountPercentage: pricingInfo.discountPercentage,
      collectShipping: true, // Collect full address for paid memberships
      mode: 'payment',
    };

    await redirectToStripeCheckout(checkoutData);
  };

  const redirectToStripeCheckout = async (checkoutData: Record<string, unknown>) => {
    // In production, this would call your backend API:
    /*
    const response = await fetch('/api/create-simple-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checkoutData),
    });
    
    const { url } = await response.json();
    window.location.href = url;
    */

    // For now, simulate the API call and redirect to existing payment links
    console.log('Checkout data:', checkoutData);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (selectedMembership) {
      if (selectedMembership.id === 'newsletter') {
        // For newsletter, show success message and reset form
        setState(prev => ({ 
          ...prev, 
          isProcessing: false, 
          successMessage: '¡Suscripción exitosa! Te has suscrito al newsletter de MIA.',
          selectedMembership: null,
          error: null 
        }));
        // Reset form states
        setTermsAccepted(false);
        setGdprAccepted(false);
        setDiscountInput('');
        setDiscountError('');
      } else {
        // Redirect to existing payment links (fallback)
        const stripeUrl = siteConfig.stripe[selectedMembership.stripeLinkKey as keyof typeof siteConfig.stripe] || '#';
        window.location.href = stripeUrl;
      }
    } else {
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const canProceed = () => {
    if (!state.selectedMembership) return false;
    if (!termsAccepted || !gdprAccepted) return false;
    return true;
  };

  return (
    <div className="min-h-screen bg-white py-12">
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

        <Card className="bg-white overflow-hidden">
          {/* Membership Selection */}
          <CardContent className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
              Selecciona tu Membresía
            </h2>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
              {membershipTypes.map((membership) => (
                <div
                  key={membership.id}
                  className={`relative rounded-lg border-2 p-6 cursor-pointer transition-all duration-200 ${
                    state.selectedMembership === membership.id
                      ? 'border-primary-500 ring-2 ring-primary-500 bg-primary-50 transform scale-105'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  } ${membership.id === 'newsletter' ? 'bg-gradient-to-br from-green-50 to-green-100' : ''}`}
                  onClick={() => setState(prev => ({ ...prev, selectedMembership: membership.id }))}
                >
                  {/* Badge */}
                  {membership.id === 'newsletter' && (
                    <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      GRATIS
                    </div>
                  )}
                  {membership.id === 'pleno-derecho' && (
                    <div className="absolute -top-3 -right-3 bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      POPULAR
                    </div>
                  )}

                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {membership.name}
                    </h3>
                    
                    <p className="text-sm text-gray-800 mb-4 min-h-[3rem] flex items-center justify-center">
                      {membership.description}
                    </p>
                    
                    <div className="mb-6">
                      {membership.price === 0 ? (
                        <div className="text-3xl font-bold text-green-600">
                          GRATUITA
                        </div>
                      ) : (
                        <div>
                          <span className="text-3xl font-bold text-gray-900">
                            €{membership.price}
                          </span>
                          <span className="text-base text-gray-700 block">
                            por año
                          </span>
                        </div>
                      )}
                    </div>

                    <ul className="text-sm text-gray-800 space-y-2">
                      {membership.benefits.slice(0, 4).map((benefit, index) => (
                        <li key={index} className="flex items-start justify-center">
                          <svg className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-left">{benefit}</span>
                        </li>
                      ))}
                      {membership.benefits.length > 4 && (
                        <li className="text-gray-700 text-center font-medium">
                          +{membership.benefits.length - 4} beneficios más
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* Discount Code Section */}
            {isPaidMembership && (
              <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  ¿Tienes un código de descuento?
                </h3>
                
                {!state.discountCode ? (
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={discountInput}
                      onChange={(e) => setDiscountInput(e.target.value.toUpperCase())}
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      placeholder="Introduce tu código..."
                      maxLength={20}
                    />
                    <Button
                      type="button"
                      onClick={applyDiscountCode}
                      variant="secondary"
                      size="sm"
                    >
                      Aplicar
                    </Button>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="font-medium text-green-800">
                            Código aplicado: <span className="font-bold">{state.discountCode}</span>
                          </p>
                          <p className="text-sm text-green-700">
                            {VALID_DISCOUNT_CODES[state.discountCode as keyof typeof VALID_DISCOUNT_CODES]?.description}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={removeDiscountCode}
                        variant="ghost"
                        size="sm"
                        className="text-green-600 hover:text-green-800"
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                )}

                {discountError && (
                  <p className="mt-2 text-sm text-red-600">{discountError}</p>
                )}
              </div>
            )}

            {/* Pricing Summary */}
            {isPaidMembership && pricingInfo && (
              <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Resumen de Pago
                </h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-800">Membresía {selectedMembership?.name}:</span>
                    <span className="font-medium">€{pricingInfo.originalPrice}</span>
                  </div>
                  
                  {pricingInfo.isValid && pricingInfo.discountPercentage > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Descuento ({pricingInfo.discountPercentage}%):</span>
                      <span>-€{pricingInfo.discountAmount}</span>
                    </div>
                  )}
                  
                  <hr className="border-gray-300" />
                  
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total:</span>
                    <span className="text-primary-600">€{pricingInfo.finalPrice}</span>
                  </div>
                  
                  {pricingInfo.finalPrice > 0 && (
                    <p className="text-sm text-gray-700 mt-2">
                      Precio anual. Los datos personales se recogerán durante el proceso de pago.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Terms and Conditions */}
            <div className="space-y-4 mb-8 p-6 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900">
                Términos y Condiciones
              </h3>

              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
                />
                <span className="ml-3 text-sm text-gray-700">
                  Acepto los{' '}
                  <a 
                    href="/terminos-condiciones" 
                    target="_blank"
                    className="text-primary-600 hover:text-primary-700 font-medium underline"
                  >
                    términos y condiciones
                  </a>{' '}
                  de uso de la plataforma *
                </span>
              </label>

              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={gdprAccepted}
                  onChange={(e) => setGdprAccepted(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
                />
                <span className="ml-3 text-sm text-gray-700">
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

            {/* Success Message */}
            {state.successMessage && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      ¡Éxito!
                    </h3>
                    <div className="mt-1 text-sm text-green-700">
                      <p>{state.successMessage}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {state.error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Error en el proceso de pago
                    </h3>
                    <div className="mt-1 text-sm text-red-700">
                      <p>{state.error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="mt-8">
              <Button
                type="button"
                onClick={handlePayment}
                disabled={!canProceed() || state.isProcessing}
                className="w-full py-3 text-lg font-medium"
                size="lg"
              >
                {state.isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                  </>
                ) : (
                  <>
                    {isPaidMembership ? (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Proceder al Pago - €{pricingInfo?.finalPrice || 0}
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Completar Registro Gratuito
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Information Section */}
        <div className="mt-12 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-4">
              Proceso de Registro Simplificado
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm text-blue-800">
              <div>
                <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                  1
                </div>
                <p><strong>Selecciona</strong><br />Elige tu tipo de membresía</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                  2
                </div>
                <p><strong>Paga</strong><br />Completa el pago seguro con Stripe</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                  3
                </div>
                <p><strong>Completa</strong><br />Termina tu perfil después del pago</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-blue-700">
              Tus datos personales se recogerán de forma segura durante el proceso de pago.
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Pago 100% Seguro
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  Procesado por Stripe con encriptación SSL. No guardamos información de tarjetas de crédito.
                  Cumplimos con RGPD y estándares PCI DSS.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
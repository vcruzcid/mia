import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { membershipTypes } from '../../utils/memberships';
import { VALID_DISCOUNT_CODES } from '../../schemas/registrationSchema';
import type { RegistrationFormData } from '../../schemas/registrationSchema';
import { Button } from '@/components/ui/button';

interface MembershipPaymentStepProps {
  pricingInfo: {
    originalPrice: number;
    discountPercentage: number;
    discountAmount: number;
    finalPrice: number;
    isValid: boolean;
  } | null;
  onNext: () => void;
  onPrevious: () => void;
}

export function MembershipPaymentStep({ pricingInfo, onNext, onPrevious }: MembershipPaymentStepProps) {
  const {
    register,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useFormContext<RegistrationFormData>();

  const [discountCodeInput, setDiscountCodeInput] = useState('');
  const [discountError, setDiscountError] = useState('');
  const [showGDPRDetails, setShowGDPRDetails] = useState(false);

  const membershipType = watch('membershipType');
  const discountCode = watch('discountCode');
  // Note: These watches are available if needed for UI logic
  // const termsAccepted = watch('termsAccepted');
  // const gdprConsent = watch('gdprConsent');
  // const marketingConsent = watch('marketingConsent');
  // const paymentMethod = watch('paymentMethod');

  // Apply discount code
  const applyDiscountCode = () => {
    const code = discountCodeInput.trim().toUpperCase();
    
    if (!code) {
      setValue('discountCode', '');
      setDiscountError('');
      return;
    }

    if (VALID_DISCOUNT_CODES[code as keyof typeof VALID_DISCOUNT_CODES]) {
      setValue('discountCode', code);
      setDiscountError('');
      trigger('discountCode');
    } else {
      setDiscountError('Código de descuento no válido');
    }
  };

  // Remove discount code
  const removeDiscountCode = () => {
    setValue('discountCode', '');
    setDiscountCodeInput('');
    setDiscountError('');
    trigger('discountCode');
  };

  // Handle next step
  const handleNext = async () => {
    const fieldsToValidate: (keyof RegistrationFormData)[] = [
      'membershipType',
      'termsAccepted',
      'gdprConsent'
    ];

    // Add payment method validation for paid memberships
    if (membershipType && !['newsletter'].includes(membershipType)) {
      fieldsToValidate.push('paymentMethod');
    }

    const isValid = await trigger(fieldsToValidate);
    
    if (isValid) {
      onNext();
    }
  };

  const selectedMembership = membershipTypes.find(m => m.id === membershipType);
  const isPaidMembership = selectedMembership && selectedMembership.price > 0;

  return (
    <div className="space-y-8">
      {/* Membership Selection */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-6">
          Selecciona tu membresía
        </h3>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {membershipTypes.map((membership) => (
            <div
              key={membership.id}
              className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all duration-200 ${
                membershipType === membership.id
                  ? 'border-primary-500 ring-2 ring-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              } ${membership.id === 'newsletter' ? 'bg-gradient-to-br from-green-50 to-green-100' : ''}`}
            >
              <input
                type="radio"
                {...register('membershipType')}
                value={membership.id}
                className="sr-only"
              />
              
              <label
                className="cursor-pointer block"
                onClick={() => setValue('membershipType', membership.id as 'pleno-derecho' | 'estudiante' | 'colaborador' | 'newsletter')}
              >
                {/* Badge */}
                {membership.id === 'newsletter' && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    GRATIS
                  </div>
                )}
                {membership.id === 'pleno-derecho' && (
                  <div className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    POPULAR
                  </div>
                )}

                <div className="text-center">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {membership.name}
                  </h4>
                  
                  <p className="text-sm text-gray-600 mb-4 min-h-[2.5rem] flex items-center justify-center">
                    {membership.description}
                  </p>
                  
                  <div className="mb-4">
                    {membership.price === 0 ? (
                      <div className="text-2xl font-bold text-green-600">
                        GRATUITA
                      </div>
                    ) : (
                      <div>
                        <span className="text-2xl font-bold text-gray-900">
                          €{membership.price}
                        </span>
                        <span className="text-sm text-gray-500">
                          /año
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <ul className="text-xs text-gray-600 space-y-1">
                  {membership.benefits.slice(0, 3).map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="h-3 w-3 text-green-500 mt-0.5 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>{benefit}</span>
                    </li>
                  ))}
                  {membership.benefits.length > 3 && (
                    <li className="text-gray-500 text-center">
                      +{membership.benefits.length - 3} beneficios más
                    </li>
                  )}
                </ul>
              </label>
            </div>
          ))}
        </div>

        {errors.membershipType && (
          <p className="mt-2 text-sm text-red-600">{errors.membershipType.message}</p>
        )}
      </div>

      {/* Discount Code (only for paid memberships) */}
      {isPaidMembership && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Código de Descuento (Opcional)
          </h3>
          
          {!discountCode ? (
            <div className="flex gap-3">
              <input
                type="text"
                value={discountCodeInput}
                onChange={(e) => setDiscountCodeInput(e.target.value.toUpperCase())}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
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
                    <p className="text-sm font-medium text-green-800">
                      Código aplicado: <span className="font-bold">{discountCode}</span>
                    </p>
                    <p className="text-sm text-green-700">
                      {VALID_DISCOUNT_CODES[discountCode as keyof typeof VALID_DISCOUNT_CODES]?.description}
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
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Resumen de Pago
          </h3>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Membresía {selectedMembership?.name}:</span>
              <span className="font-medium">€{pricingInfo.originalPrice}</span>
            </div>
            
            {pricingInfo.isValid && pricingInfo.discountPercentage > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Descuento ({pricingInfo.discountPercentage}%):</span>
                <span>-€{pricingInfo.discountAmount}</span>
              </div>
            )}
            
            <hr className="border-gray-200" />
            
            <div className="flex justify-between text-lg font-semibold">
              <span>Total:</span>
              <span className="text-primary-600">€{pricingInfo.finalPrice}</span>
            </div>
            
            {pricingInfo.finalPrice > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                * Precio anual. Renovación automática.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Payment Method (only for paid memberships) */}
      {isPaidMembership && pricingInfo && pricingInfo.finalPrice > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Método de Pago
          </h3>
          
          <div className="space-y-3">
            <label className="flex items-start">
              <input
                type="radio"
                {...register('paymentMethod')}
                value="stripe"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 mt-1"
              />
              <div className="ml-3">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900">
                    Tarjeta de crédito/débito
                  </span>
                  <div className="ml-2 flex space-x-1">
                    <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">VISA</span>
                    <span className="text-xs bg-red-100 text-red-800 px-1 rounded">MC</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Procesado de forma segura por Stripe</p>
              </div>
            </label>

            <label className="flex items-start">
              <input
                type="radio"
                {...register('paymentMethod')}
                value="bank_transfer"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 mt-1"
              />
              <div className="ml-3">
                <span className="text-sm font-medium text-gray-900">
                  Transferencia bancaria
                </span>
                <p className="text-xs text-gray-500">
                  Recibirás los datos bancarios por email para completar el pago
                </p>
              </div>
            </label>
          </div>

          {errors.paymentMethod && (
            <p className="mt-2 text-sm text-red-600">{errors.paymentMethod.message}</p>
          )}
        </div>
      )}

      {/* Terms and GDPR */}
      <div className="space-y-6 border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900">
          Términos y Condiciones
        </h3>

        {/* Terms Acceptance */}
        <div className="space-y-4">
          <label className="flex items-start">
            <input
              type="checkbox"
              {...register('termsAccepted')}
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
          {errors.termsAccepted && (
            <p className="text-sm text-red-600">{errors.termsAccepted.message}</p>
          )}

          {/* GDPR Consent */}
          <label className="flex items-start">
            <input
              type="checkbox"
              {...register('gdprConsent')}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
            />
            <span className="ml-3 text-sm text-gray-700">
              Acepto el{' '}
              <Button
                type="button"
                onClick={() => setShowGDPRDetails(!showGDPRDetails)}
                variant="link"
                className="text-primary-600 hover:text-primary-700 font-medium underline p-0 h-auto"
              >
                tratamiento de mis datos personales
              </Button>{' '}
              según la política de privacidad *
            </span>
          </label>
          {errors.gdprConsent && (
            <p className="text-sm text-red-600">{errors.gdprConsent.message}</p>
          )}

          {/* GDPR Details */}
          {showGDPRDetails && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-sm text-blue-800">
              <h4 className="font-semibold mb-2">Información sobre el tratamiento de datos</h4>
              <ul className="space-y-2 text-xs">
                <li><strong>Responsable:</strong> Mujeres en la Industria de Animación (MIA)</li>
                <li><strong>Finalidad:</strong> Gestión de la membresía, comunicaciones y servicios</li>
                <li><strong>Base legal:</strong> Consentimiento del interesado y ejecución contractual</li>
                <li><strong>Destinatarios:</strong> No se ceden datos a terceros salvo obligación legal</li>
                <li><strong>Derechos:</strong> Acceso, rectificación, supresión, limitación, portabilidad y oposición</li>
                <li><strong>Conservación:</strong> Durante la vigencia de la membresía y 5 años adicionales</li>
              </ul>
              <p className="mt-2">
                Para más información, consulta nuestra{' '}
                <a href="/politica-privacidad" className="underline font-medium">política de privacidad completa</a>.
              </p>
            </div>
          )}

          {/* Marketing Consent */}
          <label className="flex items-start">
            <input
              type="checkbox"
              {...register('marketingConsent')}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
            />
            <span className="ml-3 text-sm text-gray-700">
              Acepto recibir comunicaciones comerciales, promociones y newsletter de MIA
              <span className="block text-xs text-gray-500 mt-1">
                (Opcional - puedes darte de baja en cualquier momento)
              </span>
            </span>
          </label>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <Button
          type="button"
          onClick={onPrevious}
          variant="outline"
        >
          <svg className="mr-2 -ml-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Anterior
        </Button>

        <Button
          type="button"
          onClick={handleNext}
          className="ml-3"
        >
          Continuar
          <svg className="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </Button>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { membershipTypes, getMembershipByType } from '../utils/memberships';
import { membershipFormSchema, type MembershipFormData } from '../utils/validation';
import { useMembershipStore } from '../store/membershipStore';
import { siteConfig } from '../config/site.config';

export function MembershipPage() {
  const [selectedType, setSelectedType] = useState<string>('');
  const { setSelectedMembership, setLoading } = useMembershipStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MembershipFormData>({
    resolver: zodResolver(membershipFormSchema),
  });


  const onSubmit = async (data: MembershipFormData) => {
    try {
      setLoading(true);
      const membership = getMembershipByType(data.membershipType);
      
      if (!membership) {
        throw new Error('Tipo de membresía no válido');
      }

      setSelectedMembership(membership);
      
      // Handle free newsletter subscription
      if (membership.stripeLinkKey === 'newsletter') {
        // For newsletter subscription, you would typically send to a backend
        // or handle newsletter signup via Mailchimp API
        console.log('Newsletter subscription:', data);
        alert('¡Gracias! Te has suscrito exitosamente a nuestro newsletter.');
        setLoading(false);
        return;
      }
      
      // Redirect to Stripe payment for paid memberships
      const stripeUrl = siteConfig.stripe[membership.stripeLinkKey as keyof typeof siteConfig.stripe];
      if (stripeUrl) {
        window.location.href = stripeUrl;
      } else {
        throw new Error('URL de pago no disponible');
      }
      
    } catch (error) {
      console.error('Error processing membership:', error);
      alert('Error al procesar la membresía. Por favor, inténtalo de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Únete a MIA
          </h1>
          <p className="mt-4 text-lg text-gray-800">
            Elige el tipo de membresía que mejor se adapte a tu perfil profesional
          </p>
        </div>

        {/* Membership Options */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {membershipTypes.map((membership) => (
            <div
              key={membership.id}
              className={`relative rounded-2xl border-2 p-6 shadow-lg h-full flex flex-col ${
                selectedType === membership.id
                  ? 'border-primary-500 ring-2 ring-primary-500'
                  : 'border-gray-200'
              } ${membership.id === 'newsletter' ? 'bg-gradient-to-br from-green-50 to-green-100' : 'bg-white'}`}
            >
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

              <div className="text-center flex-shrink-0">
                <h3 className="text-xl font-semibold text-gray-900">
                  {membership.name}
                </h3>
                <p className="mt-3 text-sm text-gray-800 min-h-[2.5rem] flex items-center justify-center">
                  {membership.description}
                </p>
                <div className="mt-6 mb-6">
                  {membership.price === 0 ? (
                    <div className="text-3xl font-extrabold text-green-600">
                      GRATUITA
                    </div>
                  ) : (
                    <div>
                      <span className="text-3xl font-extrabold text-gray-900">
                        €{membership.price}
                      </span>
                      <span className="text-base font-medium text-gray-700">
                        /año
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <ul className="mt-4 space-y-3 flex-grow">
                {membership.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="h-4 w-4 text-primary-500 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-2 text-xs text-gray-700 leading-relaxed">
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => setSelectedType(membership.id)}
                className={`mt-6 w-full rounded-md py-3 px-4 text-sm font-semibold transition-colors duration-200 ${
                  selectedType === membership.id
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : membership.id === 'newsletter'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {selectedType === membership.id ? 'Seleccionado' : 'Seleccionar'}
              </button>
            </div>
          ))}
        </div>

        {/* Registration Form */}
        {selectedType && (
          <div className="mt-12 max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Datos de registro
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <input
                  type="hidden"
                  {...register('membershipType')}
                  value={selectedType}
                />

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      {...register('firstName')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Apellidos *
                    </label>
                    <input
                      type="text"
                      {...register('lastName')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email *
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    {...register('phone')}
                    placeholder="+34 600 000 000"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      {...register('acceptTerms')}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-3 text-sm text-gray-700">
                      Acepto los{' '}
                      <a href="/terminos-condiciones" className="text-primary-600 hover:text-primary-500">
                        términos y condiciones
                      </a>{' '}
                      y la{' '}
                      <a href="/politica-privacidad" className="text-primary-600 hover:text-primary-500">
                        política de privacidad
                      </a>
                      *
                    </label>
                  </div>
                  {errors.acceptTerms && (
                    <p className="text-sm text-red-600">{errors.acceptTerms.message}</p>
                  )}

                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      {...register('acceptNewsletter')}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-3 text-sm text-gray-700">
                      Quiero recibir información sobre eventos, cursos y novedades de MIA
                    </label>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {isSubmitting 
                      ? 'Procesando...' 
                      : selectedType === 'newsletter'
                      ? 'Suscribirse al Newsletter'
                      : 'Proceder al pago'
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
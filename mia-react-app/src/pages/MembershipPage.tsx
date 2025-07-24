import { Link } from 'react-router-dom';
import { membershipTypes } from '../utils/memberships';

export function MembershipPage() {
  return (
    <div className="bg-gray-900 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">
            Únete a MIA
          </h1>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Forma parte de la comunidad de mujeres profesionales en la industria de animación. 
            Elige el tipo de membresía que mejor se adapte a tu perfil.
          </p>
        </div>

        {/* Membership Cards */}
        <div className="grid gap-8 lg:grid-cols-4 md:grid-cols-2 mb-16">
          {membershipTypes.map((membership) => (
            <div
              key={membership.id}
              className={`relative bg-gray-800 rounded-xl border-2 border-gray-200 p-8 hover:border-red-600 hover:shadow-lg transition-all duration-300 ${
                membership.id === 'newsletter' 
                  ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-300' 
                  : ''
              } ${
                membership.id === 'pleno-derecho' 
                  ? 'ring-2 ring-primary-500 ring-opacity-50 border-primary-300' 
                  : ''
              }`}
            >
              {/* Badge */}
              {membership.id === 'newsletter' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-sm font-bold px-4 py-2 rounded-full">
                  GRATIS
                </div>
              )}
              {membership.id === 'pleno-derecho' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-sm font-bold px-4 py-2 rounded-full">
                  MÁS POPULAR
                </div>
              )}

              <div className="text-center">
                {/* Title */}
                <h3 className="text-2xl font-bold text-white mb-4">
                  {membership.name}
                </h3>
                
                {/* Description */}
                <p className="text-gray-700 mb-6 min-h-[3rem] flex items-center justify-center">
                  {membership.description}
                </p>
                
                {/* Price */}
                <div className="mb-8">
                  {membership.price === 0 ? (
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      GRATUITA
                    </div>
                  ) : (
                    <div className="mb-2">
                      <span className="text-5xl font-bold text-white">
                        €{membership.price}
                      </span>
                      <span className="text-lg text-gray-600 ml-2">
                        /año
                      </span>
                    </div>
                  )}
                </div>

                {/* Benefits */}
                <ul className="text-left space-y-3 mb-8">
                  {membership.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Link
                  to="/registro"
                  state={{ selectedMembership: membership.id }}
                  className={`w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg transition-all duration-200 ${
                    membership.id === 'newsletter'
                      ? 'text-white bg-green-600 hover:bg-green-700 focus:ring-green-500'
                      : membership.id === 'pleno-derecho'
                      ? 'text-white bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 transform hover:scale-105'
                      : 'text-white bg-gray-800 hover:bg-gray-900 focus:ring-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2`}
                >
                  {membership.id === 'newsletter' ? 'Suscribirse Gratis' : 'Elegir Plan'}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="bg-gray-50 rounded-2xl p-12 mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              ¿Por qué unirse a MIA?
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Somos más que una asociación, somos una comunidad que impulsa el crecimiento 
              profesional de las mujeres en la animación.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Networking Profesional</h3>
              <p className="text-gray-700">
                Conecta con profesionales de toda España y accede a oportunidades exclusivas.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.84L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Formación Continua</h3>
              <p className="text-gray-700">
                Accede a talleres, webinars y recursos formativos con descuentos especiales.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Apoyo y Mentoría</h3>
              <p className="text-gray-700">
                Recibe mentorías de profesionales expertas y forma parte de una red de apoyo.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Preguntas Frecuentes
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              ¿Cómo funciona el proceso de registro?
            </h3>
            <p className="text-gray-700">
              Simplemente selecciona tu tipo de membresía, procede al pago seguro, 
              y completa tu perfil después. ¡Es muy fácil!
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              ¿Puedo cambiar mi tipo de membresía?
            </h3>
            <p className="text-gray-700">
              Sí, puedes actualizar tu membresía en cualquier momento contactándonos. 
              Te ayudaremos con el proceso.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              ¿La membresía es anual?
            </h3>
            <p className="text-gray-700">
              Sí, todas las membresías de pago son anuales. La suscripción al newsletter 
              es completamente gratuita.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">
              ¿Qué métodos de pago aceptan?
            </h3>
            <p className="text-gray-700">
              Aceptamos tarjetas de crédito/débito y transferencias bancarias 
              a través de nuestra plataforma segura de pagos.
            </p>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center mt-16 bg-primary-50 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Lista para unirte a MIA?
          </h2>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            Forma parte de la comunidad de mujeres profesionales en animación 
            más grande de España. ¡Tu carrera te lo agradecerá!
          </p>
          <Link
            to="/registro"
            className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 transform hover:scale-105"
          >
            Comenzar Registro
            <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
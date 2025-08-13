import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion } from '@/components/ui/accordion';
import { BackgroundImage } from '@/components/ui/background-image';
import { membershipTypes } from '../utils/memberships';

export function MembershipPage() {
  const [selectedMembership, setSelectedMembership] = useState<string | null>(null);
  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-red-600 mb-6">
            Únete a MIA
          </h1>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8">
            Forma parte de la comunidad de mujeres profesionales en la industria de animación. 
            Elige el tipo de membresía que mejor se adapte a tu perfil.
          </p>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Descubre los beneficios exclusivos que obtienes al formar parte de nuestra comunidad
          </p>
        </div>

        {/* Benefits Cards */}
        <div className="mb-16">

          <div className="grid gap-8 lg:grid-cols-3 md:grid-cols-2">
            <Card className="bg-white">
              <CardContent className="text-center p-8">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-red-600 mb-2">Networking Profesional</h3>
                <p className="text-black">
                  Conecta con profesionales de toda España y accede a oportunidades exclusivas.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="text-center p-8">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.84L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-red-600 mb-2">Formación Continua</h3>
                <p className="text-black">
                  Accede a talleres, webinars y recursos formativos con descuentos especiales.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="text-center p-8">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-red-600 mb-2">Apoyo y Mentoría</h3>
                <p className="text-black">
                  Recibe mentorías de profesionales expertas y forma parte de una red de apoyo.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Membership Cards */}
        <div className="grid gap-8 lg:grid-cols-3 md:grid-cols-2 mb-16">
          {membershipTypes.map((membership) => (
            <Card
              key={membership.id}
              className={`relative hover:border-red-600 hover:shadow-lg transition-all duration-300 cursor-pointer ${
                selectedMembership === membership.id 
                  ? 'border-red-600 ring-2 ring-red-600 ring-opacity-50' 
                  : ''
              }`}
              onClick={() => setSelectedMembership(membership.id)}
            >

              <CardContent className="p-8 h-full">
                <div className="text-center flex flex-col h-full">
                {/* Title */}
                <div className="h-16 flex items-center justify-center mb-4">
                  <h3 className="text-2xl font-bold text-red-600">
                    {membership.name}
                  </h3>
                </div>
                
                {/* Description */}
                <div className="h-20 flex items-center justify-center mb-6">
                  <p className="text-white">
                    {membership.description}
                  </p>
                </div>
                
                {/* Price */}
                <div className="h-20 flex items-center justify-center mb-8">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-bold text-red-600">
                      €{membership.price}
                    </span>
                    <span className="text-lg text-red-600 ml-2">
                      /año
                    </span>
                  </div>
                </div>

                {/* Benefits */}
                <div className="flex-grow mb-8">
                  <ul className="text-left space-y-3 min-h-[200px]">
                  {membership.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-white">{benefit}</span>
                    </li>
                  ))}
                </ul>
                </div>

                {/* CTA Button */}
                <div className="mt-auto">
                  <Button asChild className="w-full" variant="default">
                    <Link
                      to="/registro"
                      state={{ selectedMembership: membership.id }}
                    >
                      Seleccionar Subscripción
                    </Link>
                  </Button>
                </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>



        {/* FAQ Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Preguntas Frecuentes
          </h2>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-white">
            <CardContent className="p-8">
              <Accordion
                items={[
                  {
                    title: "¿Cómo funciona el proceso de registro?",
                    content: "Simplemente selecciona tu tipo de membresía, procede al pago seguro, y completa tu perfil después. ¡Es muy fácil!"
                  },
                  {
                    title: "¿Puedo cambiar mi tipo de membresía?",
                    content: "Sí, puedes actualizar tu membresía en cualquier momento contactándonos. Te ayudaremos con el proceso."
                  },
                  {
                    title: "¿La membresía es anual?",
                    content: "Sí, todas las membresías de pago son anuales."
                  },
                  {
                    title: "¿Qué métodos de pago aceptan?",
                    content: "Aceptamos tarjetas de crédito/débito y transferencias bancarias a través de nuestra plataforma segura de pagos."
                  }
                ]}
              />
            </CardContent>
          </Card>
        </div>

        
      </div>

      {/* Final CTA */}
      <BackgroundImage 
        imageUrl="/images/membership-cta.webp"
        className="py-16 w-full"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-red-600 mb-4">
            ¿Lista para unirte a MIA?
          </h2>
          <p className="text-lg text-white mb-8 max-w-2xl mx-auto">
            Forma parte de la comunidad de mujeres profesionales en animación 
            más grande de España. ¡Tu carrera te lo agradecerá!
          </p>
          <Button asChild size="lg" className="inline-flex items-center">
            <Link to="/registro">
              Comenzar Registro
              <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </Button>
        </div>
      </BackgroundImage>
    </div>
  );
}
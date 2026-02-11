import { BackgroundImage } from '@/components/ui/background-image';

// TODO: Future implementation - integrate static member data
// Steps to complete this page:
// 1. Import SOCIAS array from '../data/socias.ts'
// 2. Implement client-side filtering similar to FundadorasPage
// 3. Add pagination with static data
// 4. Restore search functionality
// 5. Restore filter functionality (membership type, profession, location, availability)
// 6. Restore member cards and modal
//
// Reference: See FundadorasPage.tsx for static data implementation pattern

export function SociasPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <BackgroundImage
        imageUrl="/images/home-cta.webp"
        className="w-full py-16 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            Socias MIA
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
            Directorio de socias profesionales de la animación en España.
          </p>
        </div>
      </BackgroundImage>

      {/* Coming Soon Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="mb-8">
            <svg
              className="mx-auto h-24 w-24 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>

          <h2 className="text-3xl font-bold text-white mb-4">
            Próximamente
          </h2>

          <p className="text-xl text-gray-300 mb-8">
            El directorio de socias estará disponible próximamente.
          </p>

          <div className="bg-gray-800 rounded-lg p-8 text-left max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-white mb-4">
              ¿Qué encontrarás en esta sección?
            </h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start">
                <svg className="h-6 w-6 text-red-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Directorio completo de socias profesionales</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-red-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Búsqueda por nombre, especialización y ubicación</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-red-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Filtros por tipo de membresía y estado de disponibilidad</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-red-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Perfiles detallados con información profesional y contacto</span>
              </li>
            </ul>
          </div>

          <div className="mt-12">
            <p className="text-gray-400 mb-4">
              Mientras tanto, puedes conocer más sobre nosotras:
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/fundadoras"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors duration-200"
              >
                Ver Fundadoras
              </a>
              <a
                href="/directiva"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-600 text-base font-medium rounded-md text-white hover:bg-gray-800 transition-colors duration-200"
              >
                Ver Directiva
              </a>
              <a
                href="/sobre-mia"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-600 text-base font-medium rounded-md text-white hover:bg-gray-800 transition-colors duration-200"
              >
                Sobre MIA
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

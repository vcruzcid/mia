import { siteConfig } from '../config/site.config';

export function AboutPage() {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Sobre {siteConfig.shortName}
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Conoce nuestra historia, misión y valores
          </p>
        </div>

        <div className="mt-16">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900">
                Nuestra Historia
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Mujeres en la Industria de Animación (MIA) nació de la necesidad de crear un espacio 
                donde las profesionales del sector pudieran conectar, crecer y visibilizar su trabajo 
                en una industria tradicionalmente dominada por hombres.
              </p>
              <p className="mt-4 text-lg text-gray-600">
                Desde nuestros inicios, hemos trabajado incansablemente para promover la igualdad de 
                oportunidades, ofrecer formación especializada y crear una red de apoyo profesional 
                que impulse las carreras de nuestras socias.
              </p>
            </div>
            <div className="mt-10 lg:mt-0">
              <div className="bg-primary-50 rounded-lg p-8">
                <h3 className="text-2xl font-bold text-primary-900">Nuestros Valores</h3>
                <ul className="mt-6 space-y-4">
                  <li className="flex items-start">
                    <span className="text-primary-600 font-semibold">Igualdad:</span>
                    <span className="ml-2 text-gray-700">
                      Promovemos la igualdad de oportunidades sin distinción de género
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 font-semibold">Excelencia:</span>
                    <span className="ml-2 text-gray-700">
                      Fomentamos la calidad y la innovación en cada proyecto
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 font-semibold">Colaboración:</span>
                    <span className="ml-2 text-gray-700">
                      Creemos en el poder del trabajo en equipo y la ayuda mutua
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 font-semibold">Diversidad:</span>
                    <span className="ml-2 text-gray-700">
                      Celebramos y valoramos la diversidad en todas sus formas
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center">
            Lo que hacemos
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-primary-500 rounded-full flex items-center justify-center">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="mt-6 text-xl font-medium text-gray-900">Networking</h3>
              <p className="mt-2 text-gray-600">
                Organizamos eventos y encuentros para facilitar conexiones profesionales 
                y oportunidades de colaboración.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-primary-500 rounded-full flex items-center justify-center">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="mt-6 text-xl font-medium text-gray-900">Formación</h3>
              <p className="mt-2 text-gray-600">
                Ofrecemos cursos, talleres y recursos educativos para el desarrollo 
                profesional continuo de nuestras socias.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-primary-500 rounded-full flex items-center justify-center">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <h3 className="mt-6 text-xl font-medium text-gray-900">Visibilidad</h3>
              <p className="mt-2 text-gray-600">
                Promovemos el trabajo de las mujeres en animación a través de 
                campañas de comunicación y reconocimiento público.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 bg-gray-50 rounded-lg p-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              ¿Quieres formar parte de nuestra historia?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Únete a una comunidad comprometida con el cambio y el crecimiento 
              profesional en la industria de la animación.
            </p>
            <div className="mt-8">
              <a
                href="/membresia"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200"
              >
                Hazte socia
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useEffect } from 'react';
import { siteConfig } from '../config/site.config';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useCounterAnimation } from '../hooks/useCounterAnimation';

export function AboutPage() {
  const heroAnimation = useScrollAnimation({ threshold: 0.2 });
  const missionAnimation = useScrollAnimation({ threshold: 0.3 });
  const achievementsAnimation = useScrollAnimation({ threshold: 0.2 });
  const historyAnimation = useScrollAnimation({ threshold: 0.3 });

  const projectsCounter = useCounterAnimation(150, {
    duration: 2500,
    formatter: (value) => `${Math.floor(value)}+`,
  });
  
  const partnersCounter = useCounterAnimation(25, {
    duration: 2200,
    delay: 300,
    formatter: (value) => `${Math.floor(value)}+`,
  });
  
  const yearsCounter = useCounterAnimation(8, {
    duration: 2000,
    delay: 600,
  });

  useEffect(() => {
    if (achievementsAnimation.isIntersecting) {
      projectsCounter.startAnimation();
      partnersCounter.startAnimation();
      yearsCounter.startAnimation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [achievementsAnimation.isIntersecting, projectsCounter.startAnimation, partnersCounter.startAnimation, yearsCounter.startAnimation]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const milestones = [
    {
      year: '2017',
      title: 'Fundación de MIA',
      description: 'Un grupo de profesionales visionarias se une para crear la primera asociación de mujeres en animación de España.',
    },
    {
      year: '2018',
      title: 'Primeros eventos',
      description: 'Organizamos nuestros primeros encuentros de networking y talleres formativos.',
    },
    {
      year: '2020',
      title: 'Crecimiento digital',
      description: 'Adaptamos nuestros servicios al formato digital y expandimos nuestra presencia online.',
    },
    {
      year: '2022',
      title: 'Programa de mentorías',
      description: 'Lanzamos nuestro exitoso programa de mentorías connecting seniors con emerging talent.',
    },
    {
      year: '2024',
      title: 'Reconocimiento nacional',
      description: 'Recibimos el Premio a la Diversidad por nuestro impacto en la industria.',
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div 
        ref={heroAnimation.ref}
        className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center">
          <h1 className={`text-4xl font-extrabold text-gray-900 sm:text-5xl transition-all duration-1000 ${
            heroAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            Sobre {siteConfig.shortName}
          </h1>
          <p className={`mt-4 text-xl text-gray-600 transition-all duration-1000 delay-300 ${
            heroAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            Conoce nuestra historia, misión y valores
          </p>
          
          <div className={`mt-8 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 transition-all duration-1000 delay-500 ${
            heroAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <button
              onClick={() => scrollToSection('que-hace-mia')}
              className="w-full sm:w-auto px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-300 font-medium"
            >
              Qué hace MIA
            </button>
            <button
              onClick={() => scrollToSection('nuestros-logros')}
              className="w-full sm:w-auto px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-300 font-medium"
            >
              Nuestros logros
            </button>
            <button
              onClick={() => scrollToSection('breve-historia')}
              className="w-full sm:w-auto px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-300 font-medium"
            >
              Breve historia
            </button>
          </div>
        </div>
      </div>

      {/* Section 1: Qué hace MIA */}
      <section 
        id="que-hace-mia"
        ref={missionAnimation.ref}
        className="py-16 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl font-extrabold text-gray-900 sm:text-4xl transition-all duration-1000 ${
              missionAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              Qué hace MIA
            </h2>
            <p className={`mt-4 text-xl text-gray-600 max-w-3xl mx-auto transition-all duration-1000 delay-300 ${
              missionAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              Nuestra misión es empoderar a las mujeres en la industria de la animación española, 
              creando oportunidades y fomentando la igualdad profesional.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Key Activities */}
            <div className={`bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-all duration-500 ${
              missionAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`} style={{ transitionDelay: '400ms' }}>
              <div className="text-center">
                <div className="mx-auto h-16 w-16 bg-primary-500 rounded-full flex items-center justify-center mb-6">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Networking Profesional</h3>
                <p className="text-gray-600 leading-relaxed">
                  Organizamos eventos regulares, encuentros y actividades de networking para 
                  conectar profesionales de todos los niveles en la industria de la animación.
                </p>
              </div>
            </div>

            <div className={`bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-all duration-500 ${
              missionAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`} style={{ transitionDelay: '600ms' }}>
              <div className="text-center">
                <div className="mx-auto h-16 w-16 bg-primary-500 rounded-full flex items-center justify-center mb-6">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Formación y Desarrollo</h3>
                <p className="text-gray-600 leading-relaxed">
                  Ofrecemos programas formativos especializados, talleres técnicos y recursos 
                  educativos para el crecimiento profesional continuo de nuestras socias.
                </p>
              </div>
            </div>

            <div className={`bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-all duration-500 ${
              missionAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`} style={{ transitionDelay: '800ms' }}>
              <div className="text-center">
                <div className="mx-auto h-16 w-16 bg-primary-500 rounded-full flex items-center justify-center mb-6">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Visibilidad y Promoción</h3>
                <p className="text-gray-600 leading-relaxed">
                  Promovemos el trabajo de las mujeres en animación a través de campañas, 
                  reconocimientos públicos y oportunidades de visibilidad mediática.
                </p>
              </div>
            </div>
          </div>

          {/* Impact Visualization */}
          <div className={`mt-16 bg-white rounded-lg p-8 shadow-lg transition-all duration-1000 ${
            missionAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`} style={{ transitionDelay: '1000ms' }}>
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">Nuestro Impacto</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-600 mb-2">300+</div>
                <div className="text-sm text-gray-600">Socias activas</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-600 mb-2">50+</div>
                <div className="text-sm text-gray-600">Eventos anuales</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-600 mb-2">15+</div>
                <div className="text-sm text-gray-600">Talleres formativos</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-600 mb-2">85%</div>
                <div className="text-sm text-gray-600">Satisfacción socias</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Nuestros Logros */}
      <section 
        id="nuestros-logros"
        ref={achievementsAnimation.ref}
        className="py-16 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl font-extrabold text-gray-900 sm:text-4xl transition-all duration-1000 ${
              achievementsAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              Nuestros Logros
            </h2>
            <p className={`mt-4 text-xl text-gray-600 max-w-3xl mx-auto transition-all duration-1000 delay-300 ${
              achievementsAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              Desde nuestra fundación, hemos conseguido impactos significativos en la industria 
              de la animación española.
            </p>
          </div>

          {/* Achievement Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className={`text-center p-8 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg transition-all duration-1000 ${
              achievementsAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`} style={{ transitionDelay: '400ms' }}>
              <div className="text-5xl font-bold text-primary-600 mb-2">
                {projectsCounter.formattedValue}
              </div>
              <div className="text-lg font-medium text-gray-900 mb-2">Proyectos apoyados</div>
              <div className="text-sm text-gray-600">
                Hemos respaldado más de 150 proyectos de animación liderados por mujeres
              </div>
            </div>

            <div className={`text-center p-8 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg transition-all duration-1000 ${
              achievementsAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`} style={{ transitionDelay: '600ms' }}>
              <div className="text-5xl font-bold text-primary-600 mb-2">
                {partnersCounter.formattedValue}
              </div>
              <div className="text-lg font-medium text-gray-900 mb-2">Empresas colaboradoras</div>
              <div className="text-sm text-gray-600">
                Partnership con las principales empresas de animación del país
              </div>
            </div>

            <div className={`text-center p-8 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg transition-all duration-1000 ${
              achievementsAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`} style={{ transitionDelay: '800ms' }}>
              <div className="text-5xl font-bold text-primary-600 mb-2">
                {yearsCounter.formattedValue}
              </div>
              <div className="text-lg font-medium text-gray-900 mb-2">Años de experiencia</div>
              <div className="text-sm text-gray-600">
                Casi una década promoviendo la igualdad en la animación española
              </div>
            </div>
          </div>

          {/* Awards Showcase */}
          <div className={`grid gap-8 lg:grid-cols-2 transition-all duration-1000 ${
            achievementsAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`} style={{ transitionDelay: '1000ms' }}>
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-8 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="text-4xl">🏆</div>
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Premio Nacional de Diversidad 2024</h3>
                  <p className="text-gray-700">
                    Reconocimiento por nuestro trabajo pionero en la promoción de la igualdad 
                    de género en la industria de la animación española.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-8 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="text-4xl">🌟</div>
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Certificación de Excelencia 2023</h3>
                  <p className="text-gray-700">
                    Certificación otorgada por el Ministerio de Cultura por nuestros programas 
                    formativos y de mentorías.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-8 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="text-4xl">🎯</div>
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Impacto Social Destacado</h3>
                  <p className="text-gray-700">
                    Aumento del 40% en la participación femenina en proyectos de animación 
                    desde nuestra fundación.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-8 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="text-4xl">🤝</div>
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Red Internacional</h3>
                  <p className="text-gray-700">
                    Colaboraciones establecidas con organizaciones similares en 12 países, 
                    creando una red global de mujeres en animación.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Breve Historia */}
      <section 
        id="breve-historia"
        ref={historyAnimation.ref}
        className="py-16 bg-gray-50 relative overflow-hidden"
      >
        {/* Parallax Background Elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-200 rounded-full"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-primary-300 rounded-full"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className={`text-3xl font-extrabold text-gray-900 sm:text-4xl transition-all duration-1000 ${
              historyAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              Breve Historia
            </h2>
            <p className={`mt-4 text-xl text-gray-600 max-w-3xl mx-auto transition-all duration-1000 delay-300 ${
              historyAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              Desde nuestros humildes comienzos hasta convertirnos en una referencia nacional 
              en la promoción de la igualdad en la animación.
            </p>
          </div>

          {/* Foundation Story */}
          <div className={`mb-16 bg-white rounded-lg p-8 shadow-lg transition-all duration-1000 ${
            historyAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`} style={{ transitionDelay: '500ms' }}>
            <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">El Comienzo de MIA</h3>
                <p className="text-lg text-gray-700 mb-4">
                  En 2017, un grupo de mujeres profesionales de la animación se reunió con una visión clara: 
                  crear un espacio donde las mujeres pudieran prosperar en una industria tradicionalmente dominada por hombres.
                </p>
                <p className="text-lg text-gray-700">
                  Lo que comenzó como encuentros informales en cafeterías de Madrid y Barcelona, 
                  se convirtió rápidamente en una organización estructurada con objetivos claros 
                  y un impacto medible en el sector.
                </p>
              </div>
              <div className="mt-8 lg:mt-0">
                <div className="bg-primary-500 rounded-lg p-6 text-white">
                  <h4 className="text-lg font-semibold mb-4">Valores Fundacionales</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <span className="mr-2">💡</span>
                      <span>Innovación y excelencia creativa</span>
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2">🤝</span>
                      <span>Colaboración y apoyo mutuo</span>
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2">⚖️</span>
                      <span>Igualdad de oportunidades</span>
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2">🌟</span>
                      <span>Visibilidad del talento femenino</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-primary-200"></div>
            
            {milestones.map((milestone, index) => (
              <div
                key={milestone.year}
                className={`relative mb-12 ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} lg:flex lg:items-center`}
              >
                {/* Timeline marker */}
                <div className={`absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-primary-500 rounded-full border-4 border-white shadow-lg transition-all duration-1000 ${
                  historyAnimation.isIntersecting ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                }`} style={{ transitionDelay: `${700 + index * 200}ms` }}></div>
                
                {/* Content */}
                <div className={`lg:w-5/12 ${index % 2 === 0 ? 'lg:pr-8 lg:text-right' : 'lg:pl-8 lg:text-left'}`}>
                  <div className={`bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-500 ${
                    historyAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`} style={{ transitionDelay: `${700 + index * 200}ms` }}>
                    <div className={`text-2xl font-bold text-primary-600 mb-2 ${index % 2 === 0 ? 'lg:text-right' : 'lg:text-left'}`}>
                      {milestone.year}
                    </div>
                    <h4 className={`text-xl font-semibold text-gray-900 mb-3 ${index % 2 === 0 ? 'lg:text-right' : 'lg:text-left'}`}>
                      {milestone.title}
                    </h4>
                    <p className={`text-gray-700 ${index % 2 === 0 ? 'lg:text-right' : 'lg:text-left'}`}>
                      {milestone.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">
            ¿Quieres formar parte de nuestra historia?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Únete a una comunidad comprometida con el cambio y el crecimiento 
            profesional en la industria de la animación.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <a
              href="/membresia"
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 transition-colors duration-300 transform hover:scale-105"
            >
              Hazte socia
            </a>
            <a
              href="/contacto"
              className="inline-flex items-center px-8 py-3 border-2 border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-primary-600 transition-colors duration-300 transform hover:scale-105"
            >
              Contáctanos
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
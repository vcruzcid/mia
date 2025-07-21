import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { siteConfig } from '../config/site.config';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useCounterAnimation } from '../hooks/useCounterAnimation';

export function HomePage() {
  const heroAnimation = useScrollAnimation({ threshold: 0.2 });
  const statsAnimation = useScrollAnimation({ threshold: 0.3 });
  const featuresAnimation = useScrollAnimation({ threshold: 0.2 });
  const testimonialsAnimation = useScrollAnimation({ threshold: 0.3 });

  const memberCounter = useCounterAnimation(300, {
    duration: 2500,
    formatter: (value) => `${Math.floor(value)}+`,
  });
  
  const growthCounter = useCounterAnimation(85, {
    duration: 2200,
    delay: 300,
    formatter: (value) => `${Math.floor(value)}%`,
  });
  
  const eventCounter = useCounterAnimation(50, {
    duration: 2000,
    delay: 600,
    formatter: (value) => `${Math.floor(value)}+`,
  });

  useEffect(() => {
    if (statsAnimation.isIntersecting) {
      memberCounter.startAnimation();
      growthCounter.startAnimation();
      eventCounter.startAnimation();
    }
  }, [statsAnimation.isIntersecting, memberCounter, growthCounter, eventCounter]);

  const testimonials = [
    {
      name: "María García",
      role: "Directora de Animación",
      company: "Studio XYZ",
      quote: "MIA me ha ayudado a conectar con profesionales increíbles y a crecer en mi carrera de formas que no imaginé.",
    },
    {
      name: "Carmen López",
      role: "Animadora 3D",
      company: "Animation Plus",
      quote: "La formación y networking que ofrece MIA son invaluables para cualquier mujer en la industria.",
    },
    {
      name: "Ana Rodríguez",
      role: "Character Designer",
      company: "Creative Studios",
      quote: "Formar parte de MIA ha sido transformador para mi desarrollo profesional y personal.",
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div 
        ref={heroAnimation.ref}
        className={`relative overflow-hidden bg-gradient-to-r from-primary-600 to-primary-800 transition-all duration-1000 ${
          heroAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-gradient-to-r from-primary-600 to-primary-800 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <svg
              className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-primary-600 transform translate-x-1/2 opacity-70"
              fill="currentColor"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <polygon points="50,0 100,0 50,100 0,100" />
            </svg>

            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className={`text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl transition-all duration-1000 delay-300 ${
                  heroAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}>
                  <span className="block xl:inline">{siteConfig.name}</span>
                </h1>
                <p className={`mt-3 text-base text-primary-100 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0 transition-all duration-1000 delay-500 ${
                  heroAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}>
                  Promovemos la igualdad y visibilidad de las mujeres en la industria de la animación española, 
                  creando oportunidades de networking, formación y desarrollo profesional.
                </p>
                <div className={`mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start transition-all duration-1000 delay-700 ${
                  heroAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}>
                  <div className="rounded-md shadow-lg">
                    <Link
                      to="/membresia"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 hover:scale-105 md:py-4 md:text-lg md:px-10 transition-all duration-300 transform"
                    >
                      Únete a MIA
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      to="/sobre-mia"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-500 hover:bg-primary-400 hover:scale-105 md:py-4 md:text-lg md:px-10 transition-all duration-300 transform"
                    >
                      Conoce más
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className="h-56 w-full bg-gradient-to-br from-primary-500 to-primary-700 sm:h-72 md:h-96 lg:w-full lg:h-full flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-primary-600 opacity-20 animate-pulse"></div>
            <div className={`text-8xl transform transition-all duration-1000 delay-1000 ${
              heroAnimation.isIntersecting ? 'text-white opacity-30 scale-100 rotate-0' : 'text-white opacity-10 scale-75 rotate-12'
            }`}>
              🎬
            </div>
          </div>
        </div>
      </div>

      {/* Key Statistics */}
      <div 
        ref={statsAnimation.ref}
        className="py-12 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-12">
            <h2 className={`text-base text-primary-600 font-semibold tracking-wide uppercase transition-all duration-1000 ${
              statsAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              Nuestra Comunidad
            </h2>
            <p className={`mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl transition-all duration-1000 delay-200 ${
              statsAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              Creciendo juntas
            </p>
          </div>
          
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className={`text-center transition-all duration-1000 delay-300 ${
              statsAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <div className="text-4xl font-bold text-primary-600">
                {memberCounter.formattedValue}
              </div>
              <div className="text-sm text-gray-600 mt-2">Socias activas</div>
            </div>
            <div className={`text-center transition-all duration-1000 delay-500 ${
              statsAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <div className="text-4xl font-bold text-primary-600">
                {growthCounter.formattedValue}
              </div>
              <div className="text-sm text-gray-600 mt-2">Crecimiento anual</div>
            </div>
            <div className={`text-center transition-all duration-1000 delay-700 ${
              statsAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <div className="text-4xl font-bold text-primary-600">
                {eventCounter.formattedValue}
              </div>
              <div className="text-sm text-gray-600 mt-2">Eventos anuales</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div 
        ref={featuresAnimation.ref}
        className="py-16 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className={`text-base text-primary-600 font-semibold tracking-wide uppercase transition-all duration-1000 ${
              featuresAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              Nuestra Misión
            </h2>
            <p className={`mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl transition-all duration-1000 delay-200 ${
              featuresAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              Empoderando a las mujeres en animación
            </p>
            <p className={`mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto transition-all duration-1000 delay-300 ${
              featuresAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              Trabajamos para crear un sector más diverso, inclusivo y equitativo donde el talento femenino 
              tenga las mismas oportunidades de crecimiento y reconocimiento.
            </p>
          </div>

          <div className="mt-12">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className={`relative group hover:scale-105 transition-all duration-300 ${
                featuresAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`} style={{ transitionDelay: '400ms' }}>
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white group-hover:bg-primary-600 transition-colors duration-300">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Networking Profesional</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Conecta con profesionales, encuentra mentoras y crea colaboraciones que impulsen tu carrera en la animación.
                </dd>
              </div>

              <div className={`relative group hover:scale-105 transition-all duration-300 ${
                featuresAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`} style={{ transitionDelay: '500ms' }}>
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white group-hover:bg-primary-600 transition-colors duration-300">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Formación Continua</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Accede a cursos, talleres y recursos educativos diseñados específicamente para profesionales de la animación.
                </dd>
              </div>

              <div className={`relative group hover:scale-105 transition-all duration-300 ${
                featuresAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`} style={{ transitionDelay: '600ms' }}>
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white group-hover:bg-primary-600 transition-colors duration-300">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a1 1 0 01-1-1V9a1 1 0 011-1h1a2 2 0 100-4H4a1 1 0 01-1-1V4a1 1 0 011-1h3a1 1 0 001-1z" />
                    </svg>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Visibilidad</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Promovemos el trabajo de las mujeres en animación y creamos oportunidades para aumentar su visibilidad en el sector.
                </dd>
              </div>

              <div className={`relative group hover:scale-105 transition-all duration-300 ${
                featuresAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`} style={{ transitionDelay: '700ms' }}>
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white group-hover:bg-primary-600 transition-colors duration-300">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Comunidad</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Forma parte de una comunidad activa y comprometida con el desarrollo del talento femenino en la animación.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Member Testimonials Carousel */}
      <div 
        ref={testimonialsAnimation.ref}
        className="py-16 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className={`text-base text-primary-600 font-semibold tracking-wide uppercase transition-all duration-1000 ${
              testimonialsAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              Testimonios
            </h2>
            <p className={`mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl transition-all duration-1000 delay-200 ${
              testimonialsAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              Lo que dicen nuestras socias
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.name}
                className={`bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transform hover:scale-105 transition-all duration-500 ${
                  testimonialsAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${300 + index * 200}ms` }}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                    <div className="text-xs text-primary-600">{testimonial.company}</div>
                  </div>
                </div>
                <blockquote className="text-gray-600 italic">
                  "{testimonial.quote}"
                </blockquote>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Achievements Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">
              Logros Recientes
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Celebrando nuestros éxitos
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    🏆
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Premio a la Diversidad 2024</h3>
                  <p className="mt-2 text-gray-600">
                    Reconocimiento por nuestro trabajo en la promoción de la diversidad de género 
                    en la industria de la animación española.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    📚
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Programa de Mentorías</h3>
                  <p className="mt-2 text-gray-600">
                    Lanzamiento exitoso de nuestro programa de mentorías que ha conectado 
                    a más de 100 profesionales senior con talentos emergentes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            <span className="block">¿Lista para unirte?</span>
            <span className="block text-primary-600">Comienza tu membresía hoy.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                to="/membresia"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200"
              >
                Ver opciones de membresía
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
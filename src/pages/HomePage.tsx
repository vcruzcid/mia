import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { siteConfig } from '../config/site.config';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useCounterAnimation } from '../hooks/useCounterAnimation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BackgroundImage } from '@/components/ui/background-image';
import { VimeoVideo } from '@/components/VimeoVideo';
import { usePublicMembers, getMemberCounts } from '../hooks/useMembers';

export function HomePage() {
  const heroAnimation = useScrollAnimation({ threshold: 0.2 });
  const statsAnimation = useScrollAnimation({ threshold: 0.3 });
  const featuresAnimation = useScrollAnimation({ threshold: 0.2 });

  // Get member count from database
  const { data: members = [] } = usePublicMembers();
  const memberCounts = getMemberCounts(members);
  const activeMemberCount = memberCounts.active;

  const memberCounter = useCounterAnimation(activeMemberCount, {
    duration: 2500,
    formatter: (value) => `${Math.floor(value)}`,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statsAnimation.isIntersecting, memberCounter.startAnimation, growthCounter.startAnimation, eventCounter.startAnimation]);

  // Restart member counter when data loads (if section is already visible)
  useEffect(() => {
    if (activeMemberCount > 0 && statsAnimation.isIntersecting) {
      memberCounter.startAnimation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMemberCount, statsAnimation.isIntersecting]);


  return (
    <div style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      {/* Hero Section */}
      <div 
        ref={heroAnimation.ref}
        className={`hero relative overflow-hidden transition-all duration-1000 ${
          heroAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
        style={{ 
          background: `linear-gradient(to bottom right, var(--color-primary), var(--color-primary-hover))`,
          aspectRatio: '16/9',
          height: 'auto'
        }}
      >
        {/* Vimeo Video Background */}
        <div className="absolute inset-0 w-full h-full">
          <VimeoVideo
            videoId="1138562131"
            className="w-full h-full object-cover"
            autoplay={true}
            muted={true}
            loop={true}
            controls={false}
            title="EVENTO FINAL 3ªEDICIÓN DE MIANIMA"
          />
        </div>
        
        {/* Dark overlay to ensure text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 h-full">
          <div className="relative z-10 flex items-center justify-center h-full">
            <main className="w-full max-w-4xl">
              <div className="text-center">
                <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 transition-all duration-1000 delay-300 ${
                  heroAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}>
                  <span className="block xl:inline">{siteConfig.name}</span>
                </h1>
                <p className={`text-lg md:text-xl text-gray-100 mb-8 transition-all duration-1000 delay-500 ${
                  heroAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}>
                  Promovemos la igualdad y visibilidad de las mujeres en la industria de la animación española, 
                  creando oportunidades de networking, formación y desarrollo profesional.
                </p>
                <div className={`mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-1000 delay-700 ${
                  heroAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}>
                  <Button asChild className="w-full sm:w-auto flex items-center justify-center py-3 md:py-4 md:text-lg md:px-10 hover:scale-105 transform rounded-md shadow-lg">
                    <Link to="/membresia">
                      Únete a MIA
                    </Link>
                  </Button>
                  <Button asChild className="w-full sm:w-auto flex items-center justify-center py-3 md:py-4 md:text-lg md:px-10 hover:scale-105 transform rounded-md shadow-lg">
                    <Link to="/sobre-mia">
                      Conoce más
                    </Link>
                  </Button>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Key Statistics */}
      <div 
        ref={statsAnimation.ref}
        className="py-12 md:py-20"
        style={{ backgroundColor: 'var(--color-bg-primary)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-12">
            <h2 className={`text-base font-semibold tracking-wide uppercase transition-all duration-1000 ${
              statsAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`} style={{ color: 'var(--color-primary)' }}>
              Nuestra Comunidad
            </h2>
            <p className={`text-3xl md:text-4xl font-bold mb-4 text-center transition-all duration-1000 delay-200 ${
              statsAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`} style={{ color: 'var(--color-text-primary)' }}>
              Creciendo juntas
            </p>
          </div>
          
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className={`text-center transition-all duration-1000 delay-300 ${
              statsAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <div className="text-4xl font-bold" style={{ color: 'var(--color-primary)' }}>
                {memberCounter.formattedValue}
              </div>
              <div className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>Socias activas</div>
            </div>
            <div className={`text-center transition-all duration-1000 delay-500 ${
              statsAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <div className="text-4xl font-bold" style={{ color: 'var(--color-primary)' }}>
                {growthCounter.formattedValue}
              </div>
              <div className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>Crecimiento anual</div>
            </div>
            <div className={`text-center transition-all duration-1000 delay-700 ${
              statsAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <div className="text-4xl font-bold" style={{ color: 'var(--color-primary)' }}>
                {eventCounter.formattedValue}
              </div>
              <div className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>Eventos anuales</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div 
        ref={featuresAnimation.ref}
        className="py-12 md:py-20"
        style={{ backgroundColor: 'var(--color-bg-secondary)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className={`text-base font-semibold tracking-wide uppercase transition-all duration-1000 ${
              featuresAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`} style={{ color: 'var(--color-primary)' }}>
              Nuestra Misión
            </h2>
            <p className={`text-3xl md:text-4xl font-bold mb-4 text-center transition-all duration-1000 delay-200 ${
              featuresAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`} style={{ color: 'var(--color-text-primary)' }}>
              Empoderando a las mujeres en animación
            </p>
            <p className={`mt-4 max-w-2xl text-xl lg:mx-auto transition-all duration-1000 delay-300 ${
              featuresAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`} style={{ color: 'var(--color-text-secondary)' }}>
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
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-red-600 text-white group-hover:bg-red-700 transition-colors duration-300">
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
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-red-600 text-white group-hover:bg-red-700 transition-colors duration-300">
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
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-red-600 text-white group-hover:bg-red-700 transition-colors duration-300">
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
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-red-600 text-white group-hover:bg-red-700 transition-colors duration-300">
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


      {/* Recent Achievements Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">
              NUESTROS LOGROS
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight sm:text-4xl" style={{ color: 'var(--color-primary)' }}>
              Desde su creación, MIA ha alcanzado importantes hitos
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            <Card className="bg-gradient-to-r from-primary-50 to-primary-100">
              <CardContent className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    👥
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Red de socias</h3>
                  <p className="mt-2 text-gray-600">
                    Más de 250 profesionales iberoamericanas forman parte de MIA, creando
                    una comunidad sólida y colaborativa.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-primary-50 to-primary-100">
              <CardContent className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    📊
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Informe MIA</h3>
                  <p className="mt-2 text-gray-600">
                    Publicación bienal que analiza la situación de las mujeres en la animación en
                    España, destacando avances y áreas de mejora.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-primary-50 to-primary-100">
              <CardContent className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    🎯
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">MIANIMA</h3>
                  <p className="mt-2 text-gray-600">
                    Programa de mentoría y pitching enfocado a impulsar los proyectos liderados
                    por mujeres, algunos de los cuales han sido seleccionados en festivales internacionales
                    como Annecy, Cartoon Business, los Goya.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-primary-50 to-primary-100">
              <CardContent className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    🌍
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Participación en festivales</h3>
                  <p className="mt-2 text-gray-600">
                    Representamos la asociación en eventos nacionales e
                    internacionales, promoviendo el talento femenino y participando en paneles y espacios
                    dedicados a abrir el diálogo sobre las cuestiones existentes de género en la industria de la
                    animación.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <BackgroundImage 
        imageUrl="/images/home-cta.webp"
        className="py-12 lg:py-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">¿Lista para unirte?</span>
            <span className="block text-white">Comienza tu membresía hoy.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Button asChild className="bg-red-600 hover:bg-red-700 text-white">
                <Link to="/membresia">
                  Ver opciones de membresía
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </BackgroundImage>
    </div>
  );
}
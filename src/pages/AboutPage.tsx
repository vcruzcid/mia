import { useEffect } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useCounterAnimation } from '@/hooks/useCounterAnimation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BackgroundImage } from '@/components/ui/background-image';

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
      year: '2019',
      title: 'Fundación de MIA',
      description: 'Un grupo de profesionales visionarias se une para crear la primera asociación de mujeres en animación de España.',
    },
    {
      year: '2020',
      title: 'Primeros eventos',
      description: 'Organizamos nuestros primeros encuentros de networking y talleres formativos.',
    },
    {
      year: '2021',
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
    <div className="bg-gray-900">
      {/* Hero Section */}
      <BackgroundImage 
        ref={heroAnimation.ref}
        imageUrl="/images/about-hero.webp"
        className="w-full py-16 px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center">
          <h1 className={`text-4xl font-extrabold text-red-600 sm:text-5xl transition-all duration-1000 ${
            heroAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            Mujeres en la Industria de la Animación
          </h1>
          <p className={`mt-4 text-xl text-gray-300 transition-all duration-1000 delay-300 ${
            heroAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            Conoce nuestra historia, misión y nuestros objetivos
          </p>
          
          <div className={`mt-8 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 transition-all duration-1000 delay-500 ${
            heroAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <Button
              onClick={() => scrollToSection('que-hace-mia')}
              className="w-full sm:w-auto"
            >
              Qué hace MIA
            </Button>
            <Button
              onClick={() => scrollToSection('nuestros-objetivos')}
              className="w-full sm:w-auto"
            >
              Nuestros objetivos
            </Button>
            <Button
              onClick={() => scrollToSection('breve-historia')}
              className="w-full sm:w-auto"
            >
              Historia
            </Button>
          </div>
        </div>
      </BackgroundImage>

      {/* Section 1: Qué hace MIA */}
      <section
        id="que-hace-mia"
        ref={missionAnimation.ref}
        className="py-16 bg-gray-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl font-extrabold text-red-600 sm:text-4xl transition-all duration-1000 ${
              missionAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              Qué hace MIA
            </h2>
            <p className={`mt-4 text-xl text-gray-300 max-w-3xl mx-auto transition-all duration-1000 delay-300 ${
              missionAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
                MIA - Mujeres en la Industria de la Animación es una asociación iberoamericana que promueve la
                igualdad de género en el sector de la animación. Nuestra misión es visibilizar y fortalecer el talento
                femenino, impulsando su presencia en todos los ámbitos de la industria: desde la creación y
                producción hasta la dirección y liderazgo.</p>
              <p className={`mt-4 text-xl text-gray-300 max-w-3xl mx-auto transition-all duration-1000 delay-300 ${
              missionAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                Creamos una red de apoyo y colaboración entre mujeres con diferentes perfiles y niveles de
                experiencia, fomentando el aprendizaje mutuo, la sororidad y las oportunidades compartidas.
                Seguimos la filosofía de que juntas somos más fuertes, convencidas de que a través de la
                colaboración y el apoyo mutuo podemos transformar la industria en un espacio más diverso, justo
                y equitativo.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Nuestros Objetivos */}
      <section 
        id="nuestros-objetivos"
        ref={achievementsAnimation.ref}
        className="py-16 bg-gray-900"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl font-extrabold text-white sm:text-4xl transition-all duration-1000 ${
              achievementsAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              Nuestros Objetivos
            </h2>
            <p className={`mt-4 text-xl text-gray-300 max-w-3xl mx-auto transition-all duration-1000 delay-300 ${
              achievementsAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              Trabajamos día a día para alcanzar estos objetivos fundamentales que guían 
              nuestra misión en la industria de la animación.
            </p>
          </div>

          {/* Objectives Grid */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Objective 1 */}
            <Card 
              variant="default"
              className={`${
                achievementsAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`} 
              style={{ transitionDelay: '400ms' }}
            >
              <CardContent className="text-center p-8">
                <div className="mx-auto h-16 w-16 bg-red-600 rounded-full flex items-center justify-center mb-6">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Promover la igualdad de género</h3>
                <p className="text-gray-300 leading-relaxed">
                  Promover la igualdad de género en la industria de la animación.
                </p>
              </CardContent>
            </Card>

            {/* Objective 2 */}
            <Card 
              variant="default"
              className={`${
                achievementsAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`} 
              style={{ transitionDelay: '600ms' }}
            >
              <CardContent className="text-center p-8">
                <div className="mx-auto h-16 w-16 bg-red-600 rounded-full flex items-center justify-center mb-6">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Visibilizar el talento femenino</h3>
                <p className="text-gray-300 leading-relaxed">
                  Visibilizar el talento femenino y de género diverso en festivales, estudios, eventos y medios.
                </p>
              </CardContent>
            </Card>

            {/* Objective 3 */}
            <Card 
              variant="default"
              className={`${
                achievementsAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`} 
              style={{ transitionDelay: '800ms' }}
            >
              <CardContent className="text-center p-8">
                <div className="mx-auto h-16 w-16 bg-red-600 rounded-full flex items-center justify-center mb-6">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Fomentar formación y networking</h3>
                <p className="text-gray-300 leading-relaxed">
                  Fomentar la formación, el networking y el desarrollo profesional.
                </p>
              </CardContent>
            </Card>

            {/* Objective 4 */}
            <Card 
              variant="default"
              className={`${
                achievementsAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`} 
              style={{ transitionDelay: '1000ms' }}
            >
              <CardContent className="text-center p-8">
                <div className="mx-auto h-16 w-16 bg-red-600 rounded-full flex items-center justify-center mb-6">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">Actuar como agente de cambio</h3>
                <p className="text-gray-300 leading-relaxed">
                  Actuar como agente de cambio a través de alianzas con instituciones, escuelas y empresas del sector.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Section 3: Breve Historia */}
      <section
        id="breve-historia"
        ref={historyAnimation.ref}
        className="py-16 bg-gray-900 relative overflow-hidden"
      >
        {/* Parallax Background Elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-600 rounded-full"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-red-600 rounded-full"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className={`text-3xl font-extrabold text-red-600 sm:text-4xl transition-all duration-1000 ${
              historyAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              Breve Historia
            </h2>
            <p className={`mt-4 text-xl text-gray-300 max-w-3xl mx-auto transition-all duration-1000 delay-300 ${
              historyAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              Desde nuestros humildes comienzos hasta convertirnos en una referencia nacional
              en la promoción de la igualdad en la animación.
            </p>
          </div>

          {/* Foundation Story */}
          <Card 
            className={`mb-16 bg-gray-800 transition-all duration-1000 ${
              historyAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`} 
            style={{ transitionDelay: '500ms' }}
          >
            <CardContent className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center p-4 sm:p-8">
              <div>
                <h3 className="text-2xl font-bold text-red-600 mb-4">El Comienzo de MIA</h3>
                <p className="text-lg text-white mb-4">
                  En 2019, un grupo de mujeres profesionales de la animación se reunió con una visión clara: 
                  crear un espacio donde las mujeres pudieran prosperar en una industria tradicionalmente dominada por hombres.
                </p>
                <p className="text-lg text-white">
                  Lo que comenzó como encuentros informales en cafeterías de Madrid y Barcelona, 
                  se convirtió rápidamente en una organización estructurada con objetivos claros 
                  y un impacto medible en el sector.
                </p>
              </div>
              <div className="mt-8 lg:mt-0">
                <div className="bg-red-900 rounded-lg p-6 text-white">
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
            </CardContent>
          </Card>

          {/* Timeline */}
          <div className="relative">
            <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gray-600"></div>

            {milestones.map((milestone, index) => (
              <div
                key={milestone.year}
                className={`relative mb-8 lg:mb-12 ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} lg:flex lg:items-center`}
              >
                {/* Timeline marker — desktop only */}
                <div className={`hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-red-600 rounded-full border-4 border-gray-900 shadow-lg transition-all duration-1000 ${
                  historyAnimation.isIntersecting ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                }`} style={{ transitionDelay: `${700 + index * 200}ms` }}></div>

                {/* Content */}
                <div className={`lg:w-5/12 ${index % 2 === 0 ? 'lg:pr-8 lg:text-right' : 'lg:pl-8 lg:text-left'}`}>
                  <Card 
                    className={`bg-gray-800 transition-all duration-500 ${
                      historyAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`} 
                    style={{ transitionDelay: `${700 + index * 200}ms` }}
                  >
                    <CardContent className="p-6">
                      <div className={`text-2xl font-bold text-red-400 mb-2 ${index % 2 === 0 ? 'lg:text-right' : 'lg:text-left'}`}>
                        {milestone.year}
                      </div>
                      <h4 className={`text-xl font-semibold text-white mb-3 ${index % 2 === 0 ? 'lg:text-right' : 'lg:text-left'}`}>
                        {milestone.title}
                      </h4>
                      <p className={`text-white ${index % 2 === 0 ? 'lg:text-right' : 'lg:text-left'}`}>
                        {milestone.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <BackgroundImage 
        imageUrl="/images/about-cta.webp"
        className="py-16 w-full"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-red-600 mb-4">
            ¿Quieres formar parte de nuestra historia?
          </h2>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
            Únete a una comunidad comprometida con el cambio y el crecimiento 
            profesional en la industria de la animación.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button
              onClick={() => window.location.href = '/membresia'}
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-red-600"
            >
              Hazte socia
            </Button>
            <Button
              onClick={() => window.location.href = '/contacto'}
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-red-600"
            >
              Contáctanos
            </Button>
          </div>
        </div>
      </BackgroundImage>
    </div>
  );
}
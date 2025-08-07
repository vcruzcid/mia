import { useEffect } from 'react';
import { siteConfig } from '../config/site.config';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useCounterAnimation } from '../hooks/useCounterAnimation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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
    <div className="bg-gray-900">
      {/* Hero Section */}
      <div 
        ref={heroAnimation.ref}
        className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center">
          <h1 className={`text-4xl font-extrabold text-white sm:text-5xl transition-all duration-1000 ${
            heroAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            Sobre {siteConfig.shortName}
          </h1>
          <p className={`mt-4 text-xl text-gray-300 transition-all duration-1000 delay-300 ${
            heroAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            Conoce nuestra historia, misión y valores
          </p>
          
          <div className={`mt-8 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 transition-all duration-1000 delay-500 ${
            heroAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <Button
              onClick={() => scrollToSection('sobre-nosotras')}
              className="w-full sm:w-auto"
            >
              Qué hace MIA
            </Button>
            <Button
              onClick={() => scrollToSection('nuestros-logros')}
              className="w-full sm:w-auto"
            >
              Nuestros logros
            </Button>
            <Button
              onClick={() => scrollToSection('breve-historia')}
              className="w-full sm:w-auto"
            >
              Breve historia
            </Button>
          </div>
        </div>
      </div>

      {/* Section 1: Sobre Nosotras */}
      <section 
        id="sobre-nosotras"
        ref={missionAnimation.ref}
        className="py-16 bg-gray-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl font-extrabold text-white sm:text-4xl transition-all duration-1000 ${
              missionAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              Sobre Nosotras
            </h2>
            <p className={`mt-4 text-xl text-gray-300 max-w-4xl mx-auto transition-all duration-1000 delay-300 ${
              missionAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              MIA - Mujeres en la Industria de la Animación es una asociación iberoamericana que promueve la
              igualdad de género en el sector de la animación.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className={`text-center transition-all duration-1000 ${
              missionAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`} style={{ transitionDelay: '400ms' }}>
              <Card className="bg-gray-700 border-gray-600">
                <CardContent className="p-8 text-left">
                  <h3 className="text-2xl font-bold text-white mb-6">Qué hace MIA</h3>
                  <div className="space-y-4 text-gray-300 leading-relaxed">
                    <p>
                      Nuestra misión es visibilizar y fortalecer el talento femenino, impulsando su presencia 
                      en todos los ámbitos de la industria: desde la creación y producción hasta la dirección 
                      y liderazgo.
                    </p>
                    <p>
                      Creamos una red de apoyo y colaboración entre mujeres con diferentes perfiles y niveles de
                      experiencia, fomentando el aprendizaje mutuo, la sororidad y las oportunidades compartidas.
                    </p>
                    <p>
                      Seguimos la filosofía de que juntas somos más fuertes, convencidas de que a través de la
                      colaboración y el apoyo mutuo podemos transformar la industria en un espacio más diverso, 
                      justo y equitativo.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Nuestros Logros */}
      <section 
        id="nuestros-logros"
        ref={achievementsAnimation.ref}
        className="py-16 bg-gray-900"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl font-extrabold text-white sm:text-4xl transition-all duration-1000 ${
              achievementsAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              Nuestros Logros
            </h2>
            <p className={`mt-4 text-xl text-gray-300 max-w-3xl mx-auto transition-all duration-1000 delay-300 ${
              achievementsAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              Desde nuestra fundación, hemos conseguido impactos significativos en la industria 
              de la animación española.
            </p>
          </div>

          {/* Achievement Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className={`text-center p-8 bg-gradient-to-br from-red-900/20 to-red-800/20 rounded-lg transition-all duration-1000 ${
              achievementsAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`} style={{ transitionDelay: '400ms' }}>
              <div className="text-5xl font-bold text-red-400 mb-2">
                {projectsCounter.formattedValue}
              </div>
              <div className="text-lg font-medium text-white mb-2">Proyectos apoyados</div>
              <div className="text-sm text-gray-300">
                Hemos respaldado más de 150 proyectos de animación liderados por mujeres
              </div>
            </div>

            <div className={`text-center p-8 bg-gradient-to-br from-red-900/20 to-red-800/20 rounded-lg transition-all duration-1000 ${
              achievementsAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`} style={{ transitionDelay: '600ms' }}>
              <div className="text-5xl font-bold text-red-400 mb-2">
                {partnersCounter.formattedValue}
              </div>
              <div className="text-lg font-medium text-white mb-2">Empresas colaboradoras</div>
              <div className="text-sm text-gray-300">
                Partnership con las principales empresas de animación del país
              </div>
            </div>

            <div className={`text-center p-8 bg-gradient-to-br from-red-900/20 to-red-800/20 rounded-lg transition-all duration-1000 ${
              achievementsAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`} style={{ transitionDelay: '800ms' }}>
              <div className="text-5xl font-bold text-red-400 mb-2">
                {yearsCounter.formattedValue}
              </div>
              <div className="text-lg font-medium text-white mb-2">Años de experiencia</div>
              <div className="text-sm text-gray-300">
                Casi una década promoviendo la igualdad en la animación española
              </div>
            </div>
          </div>

          {/* Awards Showcase */}
          <div className={`grid gap-8 lg:grid-cols-2 transition-all duration-1000 ${
            achievementsAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`} style={{ transitionDelay: '1000ms' }}>
            <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100">
              <CardContent className="flex items-start p-8">
                <div className="flex-shrink-0">
                  <div className="text-4xl">🏆</div>
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-bold text-red-600 mb-2">Premio Nacional de Diversidad 2024</h3>
                  <p className="text-gray-700">
                    Reconocimiento por nuestro trabajo pionero en la promoción de la igualdad 
                    de género en la industria de la animación española.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
              <CardContent className="flex items-start p-8">
                <div className="flex-shrink-0">
                  <div className="text-4xl">🌟</div>
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-bold text-red-600 mb-2">Certificación de Excelencia 2023</h3>
                  <p className="text-gray-700">
                    Certificación otorgada por el Ministerio de Cultura por nuestros programas 
                    formativos y de mentorías.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-green-100">
              <CardContent className="flex items-start p-8">
                <div className="flex-shrink-0">
                  <div className="text-4xl">🎯</div>
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-bold text-red-600 mb-2">Impacto Social Destacado</h3>
                  <p className="text-gray-700">
                    Aumento del 40% en la participación femenina en proyectos de animación 
                    desde nuestra fundación.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-purple-100">
              <CardContent className="flex items-start p-8">
                <div className="flex-shrink-0">
                  <div className="text-4xl">🤝</div>
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-bold text-red-600 mb-2">Red Internacional</h3>
                  <p className="text-gray-700">
                    Colaboraciones establecidas con organizaciones similares en 12 países, 
                    creando una red global de mujeres en animación.
                  </p>
                </div>
              </CardContent>
            </Card>
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
            <h2 className={`text-3xl font-extrabold text-red-600 sm:text-4xl transition-all duration-1000 ${
              historyAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              Breve Historia
            </h2>
            <p className={`mt-4 text-xl text-black max-w-3xl mx-auto transition-all duration-1000 delay-300 ${
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
            <CardContent className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center p-8">
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">El Comienzo de MIA</h3>
                <p className="text-lg text-white mb-4">
                  En 2017, un grupo de mujeres profesionales de la animación se reunió con una visión clara: 
                  crear un espacio donde las mujeres pudieran prosperar en una industria tradicionalmente dominada por hombres.
                </p>
                <p className="text-lg text-white">
                  Lo que comenzó como encuentros informales en cafeterías de Madrid y Barcelona, 
                  se convirtió rápidamente en una organización estructurada con objetivos claros 
                  y un impacto medible en el sector.
                </p>
              </div>
              <div className="mt-8 lg:mt-0">
                <div className="bg-red-600 rounded-lg p-6 text-white">
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
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-primary-200"></div>
            
            {milestones.map((milestone, index) => (
              <div
                key={milestone.year}
                className={`relative mb-12 ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} lg:flex lg:items-center`}
              >
                {/* Timeline marker */}
                <div className={`absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-red-600 rounded-full border-4 border-white shadow-lg transition-all duration-1000 ${
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
      <section className="py-16 bg-red-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">
            ¿Quieres formar parte de nuestra historia?
          </h2>
          <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            Únete a una comunidad comprometida con el cambio y el crecimiento 
            profesional en la industria de la animación.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button
              onClick={() => window.location.href = '/membresia'}
              className="btn-ghost border-2 border-white text-white hover:bg-white hover:text-red-600"
            >
              Hazte socia
            </Button>
            <Button
              onClick={() => window.location.href = '/contacto'}
              className="btn-ghost border-2 border-white text-white hover:bg-white hover:text-red-600"
            >
              Contáctanos
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
 
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BackgroundImage } from '@/components/ui/background-image';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export function MianimaPage() {
  const heroAnimation = useScrollAnimation({ threshold: 0.2 });
  const contentAnimation = useScrollAnimation({ threshold: 0.3 });
  const successAnimation = useScrollAnimation({ threshold: 0.2 });

  return (
    <div className="bg-gray-900">
      {/* Hero Section */}
      <BackgroundImage 
        ref={heroAnimation.ref}
        imageUrl="/images/mianima-hero.webp"
        className="py-16 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto text-center">
          <h1 className={`text-4xl font-extrabold text-red-600 sm:text-5xl lg:text-6xl transition-all duration-1000 ${
            heroAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            MIANIMA
          </h1>
          <p className={`mt-6 max-w-3xl mx-auto text-xl text-gray-300 transition-all duration-1000 delay-200 ${
            heroAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            Programa de formación y pitching para impulsar proyectos de animación liderados por mujeres iberoamericanas
          </p>
        </div>
      </BackgroundImage>

      {/* Main Content Section */}
      <div 
        ref={contentAnimation.ref}
        className="py-16 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className={`transition-all duration-1000 ${
              contentAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <p className="text-lg text-gray-700 leading-relaxed mb-8">
                MIANIMA es nuestro programa de formación y pitching, diseñado para impulsar proyectos de
                animación liderados por mujeres iberoamericanas. MIANIMA se ha consolidado como un
                programa de referencia para el impulso y la proyección del talento femenino en la industria de la
                animación. Actualmente está abierta la convocatoria de la cuarta edición, lanzada en mayo de
                2025.
              </p>

              <p className="text-lg text-gray-700 leading-relaxed mb-8">
                A lo largo de las ediciones anteriores, hemos recibido numerosos proyectos, seleccionando
                aquellos con mayor potencial para participar en un programa intensivo de formación. Éste incluye
                mentorías personalizadas, masterclasses y sesiones de networking, con el objetivo de preparar los
                proyectos para su presentación en mercados internacionales.
              </p>

              <p className="text-lg text-gray-700 leading-relaxed mb-8">
                Al terminar el programa de formación, se celebra el evento de clausura, donde las seleccionadas
                realizan un pitch frente a un jurado internacional y se elige el proyecto ganador por cada
                categoría.
              </p>

              <p className="text-lg text-gray-700 leading-relaxed mb-8">
                En el marco del programa MIANIMA, celebramos el MIANIMA MARKET, el primer mercado de
                coproducción iberoamericano enfocado exclusivamente en proyectos de animación liderados por
                mujeres.
              </p>

              <p className="text-lg text-gray-700 leading-relaxed mb-8">
                Productoras, distribuidoras y agentes del sector interesados en descubrir nuevos talentos y
                proyectos en desarrollo pueden participar en las One-to-One Meetings, que tienen lugar durante
                el Evento Final de la tercera edición de MIANIMA.
              </p>

              <p className="text-lg text-gray-700 leading-relaxed mb-8">
                Estas reuniones están abiertas a las profesionales con proyectos seleccionados en el programa
                MIANIMA, así como a las socias de MIA que cuenten con un proyecto.
              </p>

              <p className="text-lg text-gray-700 leading-relaxed mb-12">
                El evento también cuenta con espacios específicos dedicados al recruitment y a la revisión de
                porfolios, facilitando el encuentro entre talento emergente y empresas del sector.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Cases Section */}
      <div 
        ref={successAnimation.ref}
        className="py-16 bg-gray-900"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-extrabold text-white sm:text-4xl transition-all duration-1000 ${
              successAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              Casos de éxito
            </h2>
            <p className={`mt-4 text-xl text-gray-300 transition-all duration-1000 delay-200 ${
              successAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              Proyectos que han destacado en festivales internacionales
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <Card className={`bg-white transition-all duration-1000 ${
              successAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`} style={{ transitionDelay: '300ms' }}>
              <CardContent className="p-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-600 text-white">
                      🏆
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-red-600 mb-2">"Rock Bottom" - María Trenor</h3>
                    <p className="text-gray-600 mb-3">Ganador de la 1ª edición de MIANIMA</p>
                    <p className="text-gray-700">
                      Recientemente nominado a los Premios Goya 2025.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`bg-white transition-all duration-1000 ${
              successAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`} style={{ transitionDelay: '400ms' }}>
              <CardContent className="p-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-600 text-white">
                      🎬
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-red-600 mb-2">"Mu-ki-ra" - Estefanía Piñeres</h3>
                    <p className="text-gray-600 mb-3">Ganador de la 2ª edición</p>
                    <p className="text-gray-700">
                      Seleccionado para el Animation Day del Festival de Cannes.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`bg-white transition-all duration-1000 ${
              successAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`} style={{ transitionDelay: '500ms' }}>
              <CardContent className="p-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-600 text-white">
                      🌟
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-red-600 mb-2">"El viaje de Azul" - Aline Romero</h3>
                    <p className="text-gray-600 mb-3">Seleccionado en la 2ª edición</p>
                    <p className="text-gray-700">
                      Con un recorrido destacado: selección en ANIMARKT Stop Motion Forum (Polonia), en las residencias de la
                      Academia de Cine y en Women in Animation from Spain.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`bg-white transition-all duration-1000 ${
              successAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`} style={{ transitionDelay: '600ms' }}>
              <CardContent className="p-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-600 text-white">
                      🎯
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-red-600 mb-2">"Kolaval" - Karla Velázquez</h3>
                    <p className="text-gray-600 mb-3">Seleccionado en la 3ª edición de MIANIMA</p>
                    <p className="text-gray-700">
                      Formó parte de la selección oficial de MIFA Pitches (Annecy, Francia) 2024, donde además fue premiado
                      como Mejor Presentación.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className={`mt-12 text-center transition-all duration-1000 delay-700 ${
            successAnimation.isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <p className="text-lg text-gray-300 max-w-4xl mx-auto">
              Estos proyectos, que han sido reconocidos y premiados en prestigiosos festivales y eventos
              internacionales, han recibido apoyo económico y han avanzado significativamente en su desarrollo
              gracias a la participación en MIANIMA.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <BackgroundImage 
        imageUrl="/images/mianima-cta.webp"
        className="py-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-red-600 sm:text-4xl">
            ¿Quieres conocer más sobre MIANIMA?
          </h2>
          <p className="mt-4 text-xl text-white">
            Visita nuestro sitio web oficial para obtener más información sobre el programa
          </p>
          <div className="mt-8">
            <Button asChild className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg">
              <a href="https://www.mianima.es" target="_blank" rel="noopener noreferrer">
                Visitar MIANIMA
              </a>
            </Button>
          </div>
        </div>
      </BackgroundImage>
    </div>
  );
}

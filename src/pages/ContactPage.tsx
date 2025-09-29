import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactFormSchema, type ContactFormData } from '../utils/validation';
import { useToastContext } from '../contexts/ToastContext';
import { useAsyncLoading } from '../contexts/LoadingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SocialMediaIcons } from '../components/SocialMediaIcons';
import { Accordion } from '@/components/ui/accordion';

export function ContactPage() {
  const { toast } = useToastContext();
  const { withLoading } = useAsyncLoading();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    await withLoading(async () => {
      try {
        // Here you would typically send the data to your backend
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast({
          title: 'Mensaje enviado',
          description: 'Te contactaremos pronto.',
          variant: 'success'
        });
        reset();
      } catch (error) {
        console.error('Error sending message:', error);
        toast({
          title: 'Error al enviar',
          description: 'Hubo un problema. Inténtalo de nuevo.',
          variant: 'destructive'
        });
      }
    }, 'Enviando mensaje...');
  };

  return (
    <div style={{ backgroundColor: 'var(--color-bg-primary)' }} className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold sm:text-4xl" style={{ color: 'var(--color-text-primary)' }}>
            Contacta con nosotras
          </h1>
          <p className="mt-4 text-lg" style={{ color: 'var(--color-text-secondary)' }}>
            Estamos aquí para resolver tus dudas y ayudarte en tu camino profesional
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardContent className="p-8 flex flex-col h-full">
              <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--color-text-primary)' }}>
                Información de contacto
              </h2>
              
                              <div className="space-y-8">
                <div className="flex items-start">
                  <svg className="h-6 w-6 text-primary-600 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium" style={{ color: 'var(--color-text-primary)' }}>Email</h3>
                    <p style={{ color: 'var(--color-text-secondary)' }}>hola@animacionesmia.com</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="h-6 w-6 text-primary-600 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Dirección</h3>
                    <p className="text-gray-800">Calle Santander 3, 2º Izda<br />Madrid, 28003, España</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <svg className="h-6 w-6 text-primary-600 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Horario de respuesta</h3>
                    <p className="text-gray-800">Lunes a Viernes<br />9:00 - 18:00</p>
                  </div>
                </div>
              </div>

                              <div className="mt-8 pt-8 border-t border-gray-200 flex-1 flex flex-col justify-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">
                    Síguenos en redes sociales
                  </h3>
                  <div className="flex justify-center">
                    <SocialMediaIcons 
                      socialMedia={{
                        linkedin: 'https://linkedin.com/company/animacionesmia',
                        twitter: 'https://twitter.com/animacionesmia',
                        instagram: 'https://instagram.com/animacionesmia',
                        website: 'https://animacionesmia.com'
                      }}
                      className="space-x-6"
                    />
                  </div>
                </div>
            </CardContent>
          </Card>
        </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--color-text-primary)' }}>
                  Envíanos un mensaje
                </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <Label htmlFor="contact-name" className="block text-sm font-medium text-gray-700">
                    Nombre completo *
                  </Label>
                  <Input
                    id="contact-name"
                    type="text"
                    {...register('name')}
                    className="mt-1"
                    placeholder="Tu nombre completo"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="contact-email" className="block text-sm font-medium text-gray-700">
                    Email *
                  </Label>
                  <Input
                    id="contact-email"
                    type="email"
                    {...register('email')}
                    className="mt-1"
                    placeholder="tu@email.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="contact-subject" className="block text-sm font-medium text-gray-700">
                    Asunto *
                  </Label>
                  <Input
                    id="contact-subject"
                    type="text"
                    {...register('subject')}
                    className="mt-1"
                    placeholder="¿En qué podemos ayudarte?"
                  />
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="contact-message" className="block text-sm font-medium text-gray-700">
                    Mensaje *
                  </Label>
                  <textarea
                    id="contact-message"
                    rows={6}
                    {...register('message')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Cuéntanos más detalles sobre tu consulta..."
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                  )}
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    style={{ 
                      backgroundColor: 'var(--color-btn-primary-bg)', 
                      color: 'var(--color-btn-primary-text)' 
                    }}
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar mensaje'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold mb-8 text-center" style={{ color: 'var(--color-text-primary)' }}>
                Preguntas frecuentes
              </h2>
              
              <Accordion
                items={[
                  {
                    title: "¿Quién puede hacerse socia de MIA?",
                    content: "Cualquier persona que se identifique como mujer y trabaje o estudie en el ámbito de la animación o sectores afines (ilustración, videojuegos, VFX, producción audiovisual, etc.) puede unirse a nuestra red."
                  },
                  {
                    title: "¿Cómo me hago socia?",
                    content: (
                      <>
                        Solo tienes que rellenar el formulario de inscripción disponible en nuestra web y seguir los pasos indicados. Una vez validada la solicitud, recibirás un correo de bienvenida con toda la información.{' '}
                        <Link to="/registro" className="text-red-600 hover:text-red-700 underline font-medium">
                          Únete a MIA
                        </Link>
                      </>
                    )
                  },
                  {
                    title: "¿Qué beneficios tengo como socia?",
                    content: "Acceso a una comunidad activa, participación en eventos y formaciones exclusivas, visibilidad profesional en nuestros canales, oportunidades de networking y colaboración, y posibilidad de participar en proyectos y comisiones de MIA."
                  },
                  {
                    title: "¿Ser socia tiene algún coste?",
                    content: (
                      <>
                        Sí, hay diferentes tipos de membresía. Te invitamos a consultar las diferentes opciones{' '}
                        <Link to="/membresia" className="text-red-600 hover:text-red-700 underline font-medium">
                          aquí
                        </Link>.
                      </>
                    )
                  },
                  {
                    title: "¿Puedo participar activamente en MIA?",
                    content: "Sí, animamos a todas las socias a involucrarse. Puedes formar parte de grupos de trabajo, proponer iniciativas, colaborar en eventos o participar en campañas de comunicación."
                  },
                  {
                    title: "¿Qué compromiso implica ser socia?",
                    content: "No existe una obligación formal de participación. Puedes involucrarte tanto como desees o simplemente seguir nuestras actividades y disfrutar de los beneficios de la red."
                  }
                ]}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
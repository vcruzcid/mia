import { Facebook, Twitter, Instagram, Linkedin, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactFormSchema, type ContactFormData } from '../utils/validation';
import { useToastContext } from '../contexts/ToastContext';
import { useAuth } from '../hooks/useAuth';
import { FooterLink } from './FooterLink';

export function Footer() {
  const { toast } = useToastContext();
  
  // Check authentication status
  const { member } = useAuth();
  const isDemoAuth = localStorage.getItem('demo_auth') === 'true';
  const isAuthenticated = !!(member || isDemoAuth);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (_data: ContactFormData) => {
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
  };

  return (
    <footer className="bg-black text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-96">
          {/* Left Column - Navigation */}
          <div className="lg:col-span-3 flex flex-col justify-between h-full">
            <nav className="flex flex-col justify-between h-full space-y-6">
              <FooterLink to="/">INICIO</FooterLink>
              <FooterLink to="/sobre-mia">SOBRE NOSOTRAS</FooterLink>
              <FooterLink to="/socias">SOCIAS</FooterLink>
              <FooterLink to="/directiva">DIRECTIVA</FooterLink>
              <FooterLink to="/fundadoras">FUNDADORAS</FooterLink>
              <FooterLink to="/mianima">MIANIMA</FooterLink>
              <FooterLink to="/membresia">MEMBRESÍA</FooterLink>
              <FooterLink to="/contacto">CONTACTO</FooterLink>
              {isAuthenticated ? (
                <FooterLink to="/portal">MI DASHBOARD</FooterLink>
              ) : (
                <>
                  <FooterLink to="/login">INICIAR SESIÓN</FooterLink>
                  <FooterLink to="/registro">ÚNETE A MIA</FooterLink>
                </>
              )}
            </nav>
          </div>

          {/* Center Column - Logo and Social */}
          <div className="lg:col-span-6 flex flex-col">
            <div className="flex-1 flex items-start justify-center">
              <img
                src="/mia-footer.png"
                alt="MIA - Mujeres en la Industria de la Animación"
                className="h-64 w-auto"
                onError={(e) => {
                  // Fallback to the logo we know exists
                  (e.target as HTMLImageElement).src = "/logo-main.png";
                }}
              />
            </div>
            
            <div className="flex flex-col items-center pt-2">
              <p className="text-sm text-gray-300 mb-4">SÍGUENOS</p>
              {/* Social Media Icons */}
              <div className="flex justify-center space-x-6">
                <a
                  href="https://www.facebook.com/pages/category/Cause/MIA-Mujeres-en-la-Industria-de-la-Animaci%C3%B3n-243613666305139/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full border-2 border-red-500 flex items-center justify-center text-white hover:bg-red-500 hover:text-white transition-colors duration-200"
                  aria-label="Visitar página de Facebook de MIA"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="https://twitter.com/mianimacion"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full border-2 border-red-500 flex items-center justify-center text-white hover:bg-red-500 hover:text-white transition-colors duration-200"
                  aria-label="Visitar perfil de Twitter de MIA"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="https://www.instagram.com/mianimacion/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full border-2 border-red-500 flex items-center justify-center text-white hover:bg-red-500 hover:text-white transition-colors duration-200"
                  aria-label="Visitar perfil de Instagram de MIA"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="https://www.linkedin.com/company/mia-mujeres-en-la-industria-de-la-animacion"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full border-2 border-red-500 flex items-center justify-center text-white hover:bg-red-500 hover:text-white transition-colors duration-200"
                  aria-label="Visitar perfil de LinkedIn de MIA"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a
                  href="mailto:animacionesmia@gmail.com"
                  className="w-12 h-12 rounded-full border-2 border-red-500 flex items-center justify-center text-white hover:bg-red-500 hover:text-white transition-colors duration-200"
                  aria-label="Enviar email a MIA"
                >
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-lg font-semibold mb-4">ESCRÍBENOS</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="footer-name" className="block text-sm font-medium text-gray-300">
                  Nombre completo *
                </Label>
                <input
                  id="footer-name"
                  type="text"
                  {...register('name')}
                  className="mt-1 block w-full rounded-md bg-gray-900 border-gray-700 text-white placeholder-gray-500 shadow-sm focus:border-red-500 focus:ring-red-500"
                  placeholder="Tu nombre completo"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="footer-email" className="block text-sm font-medium text-gray-300">
                  Email *
                </Label>
                <input
                  id="footer-email"
                  type="email"
                  {...register('email')}
                  className="mt-1 block w-full rounded-md bg-gray-900 border-gray-700 text-white placeholder-gray-500 shadow-sm focus:border-red-500 focus:ring-red-500"
                  placeholder="tu@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="footer-subject" className="block text-sm font-medium text-gray-300">
                  Asunto *
                </Label>
                <input
                  id="footer-subject"
                  type="text"
                  {...register('subject')}
                  className="mt-1 block w-full rounded-md bg-gray-900 border-gray-700 text-white placeholder-gray-500 shadow-sm focus:border-red-500 focus:ring-red-500"
                  placeholder="¿En qué podemos ayudarte?"
                />
                {errors.subject && (
                  <p className="mt-1 text-sm text-red-400">{errors.subject.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="footer-message" className="block text-sm font-medium text-gray-300">
                  Mensaje *
                </Label>
                <textarea
                  id="footer-message"
                  rows={4}
                  {...register('message')}
                  className="mt-1 block w-full rounded-md bg-gray-900 border-gray-700 text-white placeholder-gray-500 shadow-sm focus:border-red-500 focus:ring-red-500 resize-none"
                  placeholder="Cuéntanos más detalles sobre tu consulta..."
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-400">{errors.message.message}</p>
                )}
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isSubmitting ? 'Enviando...' : 'ENVIAR'}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
          <p className="text-sm text-gray-400 mb-4">
            Copyright 2025 Mujeres en la Industria de la Animación | All rights reserved
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <FooterLink to="/politica-cookies" className="text-sm text-red-400 hover:text-red-300">
              Política de cookies
            </FooterLink>
            <span className="text-gray-600 hidden sm:inline">|</span>
            <FooterLink to="/terminos-uso" className="text-sm text-red-400 hover:text-red-300">
              Términos de uso
            </FooterLink>
            <span className="text-gray-600 hidden sm:inline">|</span>
            <FooterLink to="/politica-privacidad" className="text-sm text-red-400 hover:text-red-300">
              Política de privacidad
            </FooterLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { loginSchema, type LoginFormData } from '@/schemas/portalSchema';
import { siteConfig } from '@/config/site.config';
import { MagicLinkSentStep } from './MagicLinkSentStep';
import type { MagicLinkResponse } from '@/types/api';

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: { sitekey: string; callback: (t: string) => void; 'expired-callback': () => void }) => string;
      remove: (id: string) => void;
    };
  }
}

type PageStep = 'email' | 'sent';

const ERROR_MESSAGES: Record<string, string> = {
  token_invalid: 'El enlace de acceso no es válido o ha expirado. Por favor solicita uno nuevo.',
  token_missing: 'No se ha proporcionado un enlace de acceso. Por favor solicita uno.',
  contact_not_found: 'No encontramos ninguna socia con ese email. Comprueba tu dirección de correo.',
};

export function PortalLoginPage() {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<PageStep>('email');
  const [magicLink, setMagicLink] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const errorParam = searchParams.get('error');
  const urlError = errorParam ? (ERROR_MESSAGES[errorParam] ?? 'Error de autenticación. Inténtalo de nuevo.') : null;

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (urlError) setStep('email');
  }, [urlError]);

  // Mount Turnstile widget when on the email step
  useEffect(() => {
    if (step !== 'email' || !turnstileRef.current || !window.turnstile) return;
    widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
      sitekey: siteConfig.turnstile.sitekey,
      callback: (token) => setTurnstileToken(token),
      'expired-callback': () => setTurnstileToken(''),
    });
    return () => {
      if (widgetIdRef.current) {
        window.turnstile?.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [step]);

  const onSubmit = async (data: LoginFormData) => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/request-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, turnstileToken }),
      });
      const result = await res.json() as MagicLinkResponse;
      if (result.success && result.magicLink) {
        setMagicLink(result.magicLink);
        setStep('sent');
      } else {
        setSubmitError(result.error ?? 'No se pudo enviar el enlace. Inténtalo de nuevo.');
      }
    } catch {
      setSubmitError('Error de conexión. Comprueba tu conexión a internet e inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 relative">
        <div className="absolute inset-0 bg-[url('/images/about-hero.webp')] bg-cover bg-center bg-no-repeat">
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <Card className="max-w-md w-full mx-4 bg-gray-800 border-gray-700 relative z-10">
          <CardHeader className="text-center">
            <img
              className="mx-auto h-16 w-auto mb-4"
              src="/logo-main.png"
              alt="MIA - Mujeres en la Industria de la Animación"
            />
            <CardTitle className="text-3xl font-bold text-white">Portal de Socias</CardTitle>
            <CardDescription className="text-gray-300">
              {step === 'email'
                ? 'Introduce tu correo electrónico para acceder'
                : 'Tu enlace de acceso está listo'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {urlError && step === 'email' && (
              <div className="p-4 rounded-lg border bg-red-900/10 border-red-400/30 text-red-400">
                <p className="text-sm">{urlError}</p>
              </div>
            )}
            {submitError && (
              <div className="p-4 rounded-lg border bg-red-900/10 border-red-400/30 text-red-400">
                <p className="text-sm">{submitError}</p>
              </div>
            )}

            {step === 'email' && (
              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">Correo electrónico</Label>
                  <Input
                    {...register('email')}
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="tu@ejemplo.com"
                    className="bg-gray-900 border-gray-700 text-white placeholder-gray-500"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-400 mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div ref={turnstileRef} />

                <Button
                  type="submit"
                  disabled={isSubmitting || !turnstileToken}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Spinner size="sm" />
                      Enviando...
                    </span>
                  ) : (
                    'Solicitar enlace de acceso'
                  )}
                </Button>

                <div className="text-center pt-2">
                  <Link
                    to="/contacto"
                    state={{ subject: 'Recuperación de acceso - Cambio de email' }}
                    className="text-sm text-gray-400 hover:text-red-400 transition-colors"
                  >
                    ¿Perdiste acceso a tu email?
                  </Link>
                </div>
              </form>
            )}

            {step === 'sent' && magicLink && (
              <MagicLinkSentStep
                magicLink={magicLink}
                isSubmitting={isSubmitting}
                onBack={() => { setStep('email'); setMagicLink(null); setSubmitError(null); setTurnstileToken(''); }}
              />
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

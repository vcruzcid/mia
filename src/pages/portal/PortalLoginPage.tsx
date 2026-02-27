import { useState, useEffect } from 'react';
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
import type { MagicLinkResponse } from '@/types/api';

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
  const [copied, setCopied] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Handle error params from verify redirect
  const errorParam = searchParams.get('error');
  const urlError = errorParam ? (ERROR_MESSAGES[errorParam] ?? 'Error de autenticación. Inténtalo de nuevo.') : null;

  useEffect(() => {
    if (urlError) {
      setStep('email');
    }
  }, [urlError]);

  const onSubmit = async (data: LoginFormData) => {
    setSubmitError(null);
    setIsSubmitting(true);
    setUserEmail(data.email);

    try {
      const res = await fetch('/api/auth/request-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
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

  const handleCopyLink = async () => {
    if (!magicLink) return;
    try {
      await navigator.clipboard.writeText(magicLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select and copy
    }
  };

  const handleResend = async () => {
    if (!userEmail) return;
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/request-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });
      const result = await res.json() as MagicLinkResponse;
      if (result.success && result.magicLink) {
        setMagicLink(result.magicLink);
        setCopied(false);
      } else {
        setSubmitError(result.error ?? 'No se pudo generar un nuevo enlace.');
      }
    } catch {
      setSubmitError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 relative">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/images/about-hero.webp)' }}
        >
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
            {/* URL error param */}
            {urlError && step === 'email' && (
              <div className="p-4 rounded-lg border bg-red-900/10 border-red-400/30 text-red-400">
                <p className="text-sm">{urlError}</p>
              </div>
            )}

            {/* Submit error */}
            {submitError && (
              <div className="p-4 rounded-lg border bg-red-900/10 border-red-400/30 text-red-400">
                <p className="text-sm">{submitError}</p>
              </div>
            )}

            {step === 'email' && (
              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">
                    Correo electrónico
                  </Label>
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

                <Button
                  type="submit"
                  disabled={isSubmitting}
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
              <div className="space-y-5">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-900/20 border border-green-400/30">
                    <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="mt-2 text-lg font-medium text-white">Enlace generado</h3>
                  <p className="mt-1 text-sm text-gray-300">
                    Tu enlace de acceso es válido durante 15 minutos.
                  </p>
                </div>

                {/* Magic link button */}
                <a
                  href={magicLink}
                  className="block w-full text-center py-3 px-4 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium transition-colors break-all text-sm"
                >
                  Acceder al portal
                </a>

                {/* Copy link button */}
                <Button
                  variant="ghost"
                  onClick={() => void handleCopyLink()}
                  className="w-full border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                >
                  {copied ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Enlace copiado
                    </span>
                  ) : (
                    'Copiar enlace'
                  )}
                </Button>

                <div className="flex flex-col gap-2 text-center">
                  <button
                    type="button"
                    onClick={() => void handleResend()}
                    disabled={isSubmitting}
                    className="text-sm text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Generando...' : 'Generar nuevo enlace'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setStep('email'); setSubmitError(null); setMagicLink(null); }}
                    className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    Usar otro correo electrónico
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

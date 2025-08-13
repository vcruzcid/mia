import { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { LocationState } from '../types';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

const loginSchema = z.object({
  email: z.string().email('Por favor ingresa un correo electrónico válido'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { sendMagicLink, verifyMagicLink, isLoading } = useAuth();
  const [step, setStep] = useState<'email' | 'sent' | 'verifying'>('email');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [userEmail, setUserEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Check if we have a token in URL params (from magic link)
  const token = searchParams.get('token');
  
  // Handle magic link verification on page load
  useEffect(() => {
    if (token) {
      setStep('verifying');
      verifyMagicLink(token).then((result: { success: boolean; message: string }) => {
        if (result.success) {
          const from = (location.state as LocationState)?.from?.pathname || '/portal';
          window.location.href = from;
        } else {
          setMessage({ type: 'error', text: result.message });
          setStep('email');
        }
      });
    }
  }, [token, verifyMagicLink, location.state]);

  const onSubmit = async (data: LoginFormData) => {
    setMessage(null);
    setUserEmail(data.email);
    
    // Demo mode: if email is "demo@test.com", simulate successful login
    if (data.email === 'demo@test.com') {
      // Simulate authentication success
      localStorage.setItem('demo_auth', 'true');
      setMessage({ type: 'success', text: 'Demo login successful! Redirecting...' });
      setTimeout(() => {
        window.location.href = '/portal';
      }, 1500);
      return;
    }
    
    const result = await sendMagicLink(data.email);
    
    if (result.success) {
      setStep('sent');
      setMessage({ type: 'success', text: result.message });
    } else {
      setMessage({ type: 'error', text: result.message });
    }
  };

  const handleResendMagicLink = async () => {
    if (!userEmail) return;
    
    setMessage(null);
    const result = await sendMagicLink(userEmail);
    
    setMessage({ 
      type: result.success ? 'success' : 'error', 
      text: result.message 
    });
  };

  if (step === 'verifying') {
    return (
      <div className="min-h-screen flex flex-col bg-gray-900 dark">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12 relative">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: 'url(/images/login-hero.webp)' }}
          >
            <div className="absolute inset-0 bg-black/30"></div>
          </div>
          <Card className="max-w-md w-full bg-gray-800 border-gray-700 relative z-10">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Spinner className="h-12 w-12 mx-auto" />
                    <h2 className="mt-4 text-2xl font-bold text-white">
                      Verificando acceso...
                    </h2>
                    <p className="mt-2 text-gray-300">
                      Por favor espera mientras verificamos tu enlace mágico.
                    </p>
                                  </div>
              </CardContent>
            </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 dark">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/images/login-hero.webp)' }}
        >
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
        <Card className="max-w-md w-full bg-gray-800 border-gray-700 relative z-10">
          <CardHeader className="text-center">
            <img
              className="mx-auto h-16 w-auto mb-4"
              src="/logo-main.png"
              alt="MIA - Mujeres en la Industria de la Animación"
            />
            <CardTitle className="text-3xl font-bold text-white">
              Portal de Socias
            </CardTitle>
            <CardDescription className="text-gray-300">
              {step === 'email' 
                ? 'Ingresa tu correo electrónico para acceder'
                : 'Hemos enviado un enlace mágico a tu correo'
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {message && (
              <div className={`p-4 rounded-lg border flex items-start gap-3 ${
                message.type === 'success' 
                  ? 'bg-green-900/10 border-green-400/30 text-green-400' 
                  : 'bg-red-900/10 border-red-400/30 text-red-400'
              }`}>
                <span className="text-sm">{message.text}</span>
              </div>
            )}

            {step === 'email' && (
              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">
                    Correo Electrónico
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
                    <p className="text-sm text-red-400">{errors.email.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Spinner className="h-4 w-4 mr-2" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar Enlace Mágico'
                  )}
                </Button>
              </form>
            )}

            {step === 'sent' && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-900/20 border border-green-400/30">
                    <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="mt-2 text-lg font-medium text-white">¡Enlace enviado!</h3>
                  <p className="mt-1 text-sm text-gray-300">
                    Revisa tu correo electrónico y haz clic en el enlace para acceder al portal.
                  </p>
                  <p className="mt-2 text-xs text-gray-400">
                    El enlace será válido por 15 minutos.
                  </p>
                </div>

                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={handleResendMagicLink}
                    disabled={isLoading}
                    className="text-red-400 hover:text-red-300 font-medium disabled:opacity-50 p-0"
                  >
                    {isLoading ? 'Reenviando...' : 'Reenviar enlace'}
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  onClick={() => setStep('email')}
                  className="w-full text-gray-400 hover:text-gray-300 hover:bg-gray-800"
                >
                  ← Usar otro correo electrónico
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
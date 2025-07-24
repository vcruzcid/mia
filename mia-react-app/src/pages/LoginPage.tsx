import { useState } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

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
  useState(() => {
    if (token) {
      setStep('verifying');
      verifyMagicLink(token).then((result) => {
        if (result.success) {
          const from = (location.state as any)?.from?.pathname || '/portal';
          window.location.href = from;
        } else {
          setMessage({ type: 'error', text: result.message });
          setStep('email');
        }
      });
    }
  });

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
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
            <h2 className="mt-4 text-2xl font-bold text-white">
              Verificando acceso...
            </h2>
            <p className="mt-2 text-gray-300">
              Por favor espera mientras verificamos tu enlace mágico.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <img
            className="mx-auto h-16 w-auto"
            src="/mia_logo_web-ok-177x77.png"
            alt="MIA - Mujeres en la Industria de la Animación"
          />
          <h2 className="mt-6 text-3xl font-bold text-white">
            Portal de Socias
          </h2>
          <p className="mt-2 text-sm text-gray-300">
            {step === 'email' 
              ? 'Ingresa tu correo electrónico para acceder'
              : 'Hemos enviado un enlace mágico a tu correo'
            }
          </p>
        </div>

        {message && (
          <div className={`rounded-md p-4 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <p className="text-sm">{message.text}</p>
          </div>
        )}

        {step === 'email' && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="form-label">
                Correo Electrónico
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className="form-input"
                placeholder="tu@ejemplo.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full justify-center disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enviando...
                </>
              ) : (
                'Enviar Enlace Mágico'
              )}
            </button>
          </form>
        )}

        {step === 'sent' && (
          <div className="mt-8 space-y-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <button
                onClick={handleResendMagicLink}
                disabled={isLoading}
                className="text-sm text-red-400 hover:text-red-300 font-medium disabled:opacity-50"
              >
                {isLoading ? 'Reenviando...' : 'Reenviar enlace'}
              </button>
            </div>

            <button
              onClick={() => setStep('email')}
              className="w-full text-sm text-gray-400 hover:text-gray-300"
            >
              ← Usar otro correo electrónico
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
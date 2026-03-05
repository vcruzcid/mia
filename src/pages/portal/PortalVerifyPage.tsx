import { useEffect, useRef, useReducer } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

const ERROR_MESSAGES: Record<string, string> = {
  token_invalid: 'El enlace de acceso no es válido o ha expirado. Por favor solicita uno nuevo.',
  token_missing: 'No se ha proporcionado un enlace de acceso. Por favor solicita uno.',
  contact_not_found: 'No encontramos ninguna socia con ese email. Comprueba tu dirección de correo.',
  membership_inactive: 'Tu membresía no está activa. Si crees que es un error, contacta con nosotras.',
};

type VerifyState =
  | { status: 'loading' }
  | { status: 'error'; message: string };

export function PortalVerifyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const stateRef = useRef<VerifyState>({ status: 'loading' });
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

  useEffect(() => {
    if (!token) {
      stateRef.current = {
        status: 'error',
        message: ERROR_MESSAGES.token_missing,
      };
      forceUpdate();
      return;
    }

    let cancelled = false;

    fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`, {
      credentials: 'include',
    })
      .then(async (res) => {
        if (cancelled) return;
        const data = await res.json() as { success: boolean; error?: string };
        if (data.success) {
          navigate('/portal/perfil', { replace: true });
        } else {
          const errorKey = data.error ?? '';
          stateRef.current = {
            status: 'error',
            message: ERROR_MESSAGES[errorKey] ?? 'Error de autenticación. Inténtalo de nuevo.',
          };
          forceUpdate();
        }
      })
      .catch(() => {
        if (cancelled) return;
        stateRef.current = {
          status: 'error',
          message: 'Error de conexión. Comprueba tu conexión a internet e inténtalo de nuevo.',
        };
        forceUpdate();
      });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const state = stateRef.current;

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
              {state.status === 'loading'
                ? 'Verificando tu enlace de acceso...'
                : 'No se pudo verificar el enlace'}
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col items-center gap-6">
            {state.status === 'loading' && (
              <div className="flex flex-col items-center gap-4 py-4">
                <Spinner size="lg" />
                <p className="text-gray-300 text-sm text-center">
                  Estamos comprobando tu enlace de acceso, un momento...
                </p>
              </div>
            )}

            {state.status === 'error' && (
              <>
                <div className="w-full p-4 rounded-lg border bg-red-900/10 border-red-400/30 text-red-400">
                  <p className="text-sm">{state.message}</p>
                </div>
                <Button asChild className="w-full bg-red-600 hover:bg-red-700">
                  <Link to="/portal/login">Solicitar nuevo enlace</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

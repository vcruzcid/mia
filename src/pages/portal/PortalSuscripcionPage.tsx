import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortalAuth } from '@/hooks/usePortalAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function PortalSuscripcionPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading, member } = usePortalAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/portal/login', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleManageSubscription = async () => {
    if (!member?.email) return;
    setIsRedirecting(true);
    setError(null);
    try {
      const res = await fetch('/api/customer-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: member.email }),
      });
      const data = await res.json() as { success: boolean; url?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? 'No se pudo abrir el portal de suscripción.');
        setIsRedirecting(false);
        return;
      }
      let redirectUrl: URL | null = null;
      try { redirectUrl = new URL(data.url ?? ''); } catch { /* invalid URL */ }
      if (redirectUrl?.protocol === 'https:' && redirectUrl.hostname === 'billing.stripe.com') {
        window.location.href = redirectUrl.href;
      } else {
        setError(data.error ?? 'No se pudo abrir el portal de suscripción.');
        setIsRedirecting(false);
      }
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.');
      setIsRedirecting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Mi Suscripción</h1>
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6 space-y-6">
          {member && (
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Email de cuenta</span>
              <span className="text-white text-sm">{member.email}</span>
            </div>
          )}
          <hr className="border-gray-700" />
          <div className="space-y-3">
            <h2 className="text-white font-medium">Gestionar suscripción</h2>
            <p className="text-gray-400 text-sm">
              Desde el portal de Stripe puedes consultar tus facturas, actualizar tu método de pago
              o cancelar tu suscripción.
            </p>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button
              onClick={() => void handleManageSubscription()}
              disabled={isRedirecting}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              {isRedirecting ? 'Redirigiendo...' : 'Gestionar suscripción en Stripe'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

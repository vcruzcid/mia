import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';

async function verifyMagicToken(token: string): Promise<{ success: boolean; error?: string }> {
  const res = await fetch('/api/auth/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ token }),
  });
  return res.json() as Promise<{ success: boolean; error?: string }>;
}

// Reads the magic link token from the URL hash and POSTs it to /api/auth/verify.
// The hash fragment is never sent to the server by the browser, so email scanners
// cannot pre-fetch and consume the single-use token.
export function PortalAccesoPage() {
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: verifyMagicToken,
    onSuccess: (result) => {
      if (result.success) {
        void navigate('/portal/perfil', { replace: true });
      } else {
        void navigate(`/portal/login?error=${result.error ?? 'token_invalid'}`, { replace: true });
      }
    },
    onError: () => {
      void navigate('/portal/login?error=server_error', { replace: true });
    },
  });

  useEffect(() => {
    const token = new URLSearchParams(window.location.hash.slice(1)).get('token');
    if (!token) {
      void navigate('/portal/login?error=token_missing', { replace: true });
      return;
    }
    mutation.mutate(token);
  }, [mutation.mutate, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
    </div>
  );
}

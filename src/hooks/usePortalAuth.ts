import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { AuthMeResponse } from '@/types/api';

async function fetchMe(): Promise<AuthMeResponse> {
  const res = await fetch('/api/auth/me', { credentials: 'include' });
  return res.json() as Promise<AuthMeResponse>;
}

async function postLogout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
}

export function usePortalAuth() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['portal', 'me'],
    queryFn: fetchMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const logoutMutation = useMutation({
    mutationFn: postLogout,
    onSuccess: () => {
      queryClient.clear();
      navigate('/portal/login', { replace: true });
    },
  });

  const isAuthenticated = data?.success === true && !!data.member;
  const member = data?.member ?? null;

  return {
    isAuthenticated,
    isLoading,
    isError,
    member,
    logout: () => logoutMutation.mutate(),
    isLoggingOut: logoutMutation.isPending,
  };
}

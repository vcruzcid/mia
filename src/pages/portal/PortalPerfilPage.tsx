import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePortalAuth } from '@/hooks/usePortalAuth';
import type { PortalProfileResponse, PortalProfile } from '@/types/api';
import type { ProfileEditFormData } from '@/schemas/portalSchema';
import { PhotoCard } from './PhotoCard';
import { PersonalInfoSection } from './PersonalInfoSection';
import { EspecialidadesSection } from './EspecialidadesSection';
import { RedesSocialesSection } from './RedesSocialesSection';

async function fetchProfile(): Promise<PortalProfileResponse> {
  const res = await fetch('/api/portal/profile', { credentials: 'include' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<PortalProfileResponse>;
}

async function saveProfile(data: ProfileEditFormData): Promise<{ success: boolean; error?: string }> {
  const res = await fetch('/api/portal/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const result = await res.json() as { success: boolean; error?: string };
  if (!result.success) throw new Error(result.error ?? 'Error actualizando perfil');
  return result;
}

function profileToFormData(p: PortalProfile): ProfileEditFormData {
  return {
    firstName: p.firstName,
    lastName: p.lastName,
    bio: p.bio ?? '',
    city: p.city ?? '',
    country: p.country ?? '',
    specializations: p.specializations,
    socialLinks: { ...p.socialLinks },
  };
}

export function PortalPerfilPage() {
  const { isAuthenticated } = usePortalAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['portal', 'profile'],
    queryFn: fetchProfile,
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });

  const updateMutation = useMutation({ mutationFn: saveProfile });

  const handleSaveSection = useCallback(
    async (partial: Partial<ProfileEditFormData>): Promise<void> => {
      await updateMutation.mutateAsync({
        ...profileToFormData(data!.profile!),
        ...partial,
      });
      await queryClient.invalidateQueries({ queryKey: ['portal', 'profile'] });
    },
    [data, updateMutation, queryClient],
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
      </div>
    );
  }

  if (isError || !data?.profile) {
    return (
      <div className="text-center py-16">
        <p className="text-red-400 mb-4">Error cargando el perfil.</p>
        <button
          onClick={() => window.location.reload()}
          className="text-gray-400 underline hover:text-gray-300 text-sm"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-white">Mi Perfil</h1>
      <PhotoCard profile={data.profile} />
      <PersonalInfoSection profile={data.profile} onSave={handleSaveSection} />
      <EspecialidadesSection profile={data.profile} onSave={handleSaveSection} />
      <RedesSocialesSection profile={data.profile} onSave={handleSaveSection} />
    </div>
  );
}

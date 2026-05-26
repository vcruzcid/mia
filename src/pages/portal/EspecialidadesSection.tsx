import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { profileEditSchema, type ProfileEditFormData } from '@/schemas/portalSchema';
import type { PortalProfile } from '@/types/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SpecializationsGrid } from './SpecializationsGrid';

const especSchema = profileEditSchema.pick({ specializations: true });
type EspecFormData = z.infer<typeof especSchema>;

interface EspecialidadesSectionProps {
  profile: PortalProfile;
  onSave: (partial: Partial<ProfileEditFormData>) => Promise<void>;
}

export function EspecialidadesSection({ profile, onSave }: EspecialidadesSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EspecFormData>({
    resolver: zodResolver(especSchema),
    defaultValues: { specializations: profile.specializations },
  });

  useEffect(() => {
    reset({ specializations: profile.specializations });
  }, [profile.specializations, reset]);

  const handleCancel = () => {
    reset({ specializations: profile.specializations });
    setSaveError(undefined);
    setIsEditing(false);
  };

  const handleSave = async (data: EspecFormData) => {
    setIsSaving(true);
    setSaveError(undefined);
    try {
      await onSave(data);
      setIsEditing(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
          Especialidades
        </span>
        {!isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="text-gray-300 hover:text-white hover:bg-gray-700"
          >
            Editar
          </Button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
          <Controller
            name="specializations"
            control={control}
            render={({ field }) => (
              <SpecializationsGrid
                selected={field.value}
                onChange={field.onChange}
                error={errors.specializations?.message}
              />
            )}
          />

          {saveError && (
            <div className="p-3 rounded-md bg-red-900/10 border border-red-400/30">
              <p className="text-sm text-red-400">{saveError}</p>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-1">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
              disabled={isSaving}
              className="text-gray-300 hover:text-white hover:bg-gray-700"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              {isSaving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      ) : profile.specializations.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {profile.specializations.map((spec) => (
            <Badge key={spec} variant="outline" className="text-gray-300 border-gray-600 text-xs">
              {spec}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm italic">Sin especialidades todavía.</p>
      )}
    </div>
  );
}

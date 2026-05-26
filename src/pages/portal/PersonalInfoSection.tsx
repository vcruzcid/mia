import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { profileEditSchema, type ProfileEditFormData } from '@/schemas/portalSchema';
import type { PortalProfile } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const personalSchema = profileEditSchema.pick({
  firstName: true,
  lastName: true,
  bio: true,
  city: true,
  country: true,
});
type PersonalFormData = z.infer<typeof personalSchema>;

interface PersonalInfoSectionProps {
  profile: PortalProfile;
  onSave: (partial: Partial<ProfileEditFormData>) => Promise<void>;
}

function toDefaults(p: PortalProfile): PersonalFormData {
  return {
    firstName: p.firstName,
    lastName: p.lastName,
    bio: p.bio ?? '',
    city: p.city ?? '',
    country: p.country ?? '',
  };
}

export function PersonalInfoSection({ profile, onSave }: PersonalInfoSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PersonalFormData>({
    resolver: zodResolver(personalSchema),
    defaultValues: toDefaults(profile),
  });

  useEffect(() => {
    reset(toDefaults(profile));
  }, [profile, reset]);

  const bioValue = watch('bio') ?? '';

  const handleCancel = () => {
    reset(toDefaults(profile));
    setSaveError(undefined);
    setIsEditing(false);
  };

  const handleSave = async (data: PersonalFormData) => {
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
          Información personal
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="firstName" className="text-gray-300">
                Nombre
              </Label>
              <Input
                {...register('firstName')}
                id="firstName"
                className="bg-gray-900 border-gray-700 text-white"
              />
              {errors.firstName && (
                <p className="text-sm text-red-400">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="lastName" className="text-gray-300">
                Apellidos
              </Label>
              <Input
                {...register('lastName')}
                id="lastName"
                className="bg-gray-900 border-gray-700 text-white"
              />
              {errors.lastName && (
                <p className="text-sm text-red-400">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="bio" className="text-gray-300">
                Biografía
              </Label>
              <span className="text-xs text-gray-500">{bioValue.length}/1000</span>
            </div>
            <Textarea
              {...register('bio')}
              id="bio"
              rows={4}
              placeholder="Cuéntanos sobre ti, tu experiencia y tus proyectos..."
              className="bg-gray-900 border-gray-700 text-white placeholder-gray-500 resize-none"
            />
            {errors.bio && <p className="text-sm text-red-400">{errors.bio.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="city" className="text-gray-300">
                Ciudad
              </Label>
              <Input
                {...register('city')}
                id="city"
                placeholder="Madrid"
                className="bg-gray-900 border-gray-700 text-white placeholder-gray-500"
              />
              {errors.city && <p className="text-sm text-red-400">{errors.city.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="country" className="text-gray-300">
                País
              </Label>
              <Input
                {...register('country')}
                id="country"
                placeholder="España"
                className="bg-gray-900 border-gray-700 text-white placeholder-gray-500"
              />
              {errors.country && <p className="text-sm text-red-400">{errors.country.message}</p>}
            </div>
          </div>

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
      ) : (
        <div className="space-y-1.5">
          <p className="text-white font-medium">
            {profile.firstName} {profile.lastName}
          </p>
          {(profile.city || profile.country) && (
            <p className="text-gray-400 text-sm">
              {[profile.city, profile.country].filter(Boolean).join(', ')}
            </p>
          )}
          {profile.bio ? (
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap mt-2">
              {profile.bio}
            </p>
          ) : (
            <p className="text-gray-500 text-sm italic">Sin biografía todavía.</p>
          )}
        </div>
      )}
    </div>
  );
}

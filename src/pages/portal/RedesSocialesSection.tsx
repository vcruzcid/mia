import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { profileEditSchema, type ProfileEditFormData } from '@/schemas/portalSchema';
import type { PortalProfile } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const redesSchema = z.object({ socialLinks: profileEditSchema.shape.socialLinks });
type RedesFormData = z.infer<typeof redesSchema>;

interface RedesSocialesSectionProps {
  profile: PortalProfile;
  onSave: (partial: Partial<ProfileEditFormData>) => Promise<void>;
}

function toDefaults(p: PortalProfile): RedesFormData {
  return {
    socialLinks: {
      linkedin: p.socialLinks.linkedin ?? '',
      instagram: p.socialLinks.instagram ?? '',
      twitter: p.socialLinks.twitter ?? '',
      website: p.socialLinks.website ?? '',
    },
  };
}

function SocialLink({ label, value, isHandle }: { label: string; value: string; isHandle?: boolean }) {
  if (!value) return null;
  const href = isHandle
    ? label === 'Instagram'
      ? `https://instagram.com/${value.replace('@', '')}`
      : `https://twitter.com/${value.replace('@', '')}`
    : value;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm text-red-400 hover:text-red-300 transition-colors"
    >
      {label}: {isHandle && !value.startsWith('@') ? `@${value}` : value}
    </a>
  );
}

export function RedesSocialesSection({ profile, onSave }: RedesSocialesSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RedesFormData>({
    resolver: zodResolver(redesSchema),
    defaultValues: toDefaults(profile),
  });

  useEffect(() => {
    reset(toDefaults(profile));
  }, [profile, reset]);

  const handleCancel = () => {
    reset(toDefaults(profile));
    setSaveError(undefined);
    setIsEditing(false);
  };

  const handleSave = async (data: RedesFormData) => {
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

  const { linkedin, instagram, twitter, website } = profile.socialLinks;
  const hasLinks = linkedin || instagram || twitter || website;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
          Redes y web
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
              <Label htmlFor="linkedin" className="text-xs text-gray-400">
                LinkedIn (URL)
              </Label>
              <Input
                {...register('socialLinks.linkedin')}
                id="linkedin"
                type="url"
                placeholder="https://linkedin.com/in/tu-perfil"
                className="bg-gray-900 border-gray-700 text-white placeholder-gray-500"
              />
              {errors.socialLinks?.linkedin && (
                <p className="text-sm text-red-400">{errors.socialLinks.linkedin.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="website" className="text-xs text-gray-400">
                Sitio web (URL)
              </Label>
              <Input
                {...register('socialLinks.website')}
                id="website"
                type="url"
                placeholder="https://tu-portfolio.com"
                className="bg-gray-900 border-gray-700 text-white placeholder-gray-500"
              />
              {errors.socialLinks?.website && (
                <p className="text-sm text-red-400">{errors.socialLinks.website.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="instagram" className="text-xs text-gray-400">
                Instagram (usuario)
              </Label>
              <Input
                {...register('socialLinks.instagram')}
                id="instagram"
                placeholder="@tu_usuario"
                className="bg-gray-900 border-gray-700 text-white placeholder-gray-500"
              />
              {errors.socialLinks?.instagram && (
                <p className="text-sm text-red-400">{errors.socialLinks.instagram.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="twitter" className="text-xs text-gray-400">
                Twitter / X (usuario)
              </Label>
              <Input
                {...register('socialLinks.twitter')}
                id="twitter"
                placeholder="@tu_usuario"
                className="bg-gray-900 border-gray-700 text-white placeholder-gray-500"
              />
              {errors.socialLinks?.twitter && (
                <p className="text-sm text-red-400">{errors.socialLinks.twitter.message}</p>
              )}
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
      ) : hasLinks ? (
        <div className="flex flex-col gap-1.5">
          <SocialLink label="LinkedIn" value={linkedin} />
          <SocialLink label="Instagram" value={instagram} isHandle />
          <SocialLink label="Twitter / X" value={twitter} isHandle />
          <SocialLink label="Web" value={website} />
        </div>
      ) : (
        <p className="text-gray-500 text-sm italic">Sin redes sociales todavía.</p>
      )}
    </div>
  );
}

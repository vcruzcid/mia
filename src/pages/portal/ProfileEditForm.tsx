import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileEditSchema, type ProfileEditFormData } from '@/schemas/portalSchema';
import type { PortalProfile } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SpecializationsGrid } from './SpecializationsGrid';
import { SocialLinksFields } from './SocialLinksFields';

interface ProfileEditFormProps {
  profile: PortalProfile;
  onSubmit: (data: ProfileEditFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  submitError?: string;
}

export function ProfileEditForm({
  profile,
  onSubmit,
  onCancel,
  isSubmitting,
  submitError,
}: ProfileEditFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<ProfileEditFormData>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      bio: profile.bio,
      city: profile.city,
      country: profile.country,
      specializations: profile.specializations,
      socialLinks: {
        linkedin: profile.socialLinks.linkedin,
        instagram: profile.socialLinks.instagram,
        twitter: profile.socialLinks.twitter,
        website: profile.socialLinks.website,
      },
    },
  });

  const bioValue = watch('bio') ?? '';

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-6"
    >
      <h2 className="text-lg font-semibold text-white">Editar perfil</h2>

      {/* Name row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="firstName" className="text-gray-300">Nombre</Label>
          <Input
            {...register('firstName')}
            id="firstName"
            placeholder="Tu nombre"
            className="bg-gray-900 border-gray-700 text-white placeholder-gray-500"
          />
          {errors.firstName && (
            <p className="text-sm text-red-400 mt-1">{errors.firstName.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="lastName" className="text-gray-300">Apellidos</Label>
          <Input
            {...register('lastName')}
            id="lastName"
            placeholder="Tus apellidos"
            className="bg-gray-900 border-gray-700 text-white placeholder-gray-500"
          />
          {errors.lastName && (
            <p className="text-sm text-red-400 mt-1">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label htmlFor="bio" className="text-gray-300">Biografía</Label>
          <span className="text-xs text-gray-500">{bioValue.length}/1000</span>
        </div>
        <Textarea
          {...register('bio')}
          id="bio"
          rows={4}
          placeholder="Cuéntanos sobre ti, tu experiencia y tus proyectos..."
          className="bg-gray-900 border-gray-700 text-white placeholder-gray-500 resize-none"
        />
        {errors.bio && (
          <p className="text-sm text-red-400 mt-1">{errors.bio.message}</p>
        )}
      </div>

      {/* Location row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="city" className="text-gray-300">Ciudad</Label>
          <Input
            {...register('city')}
            id="city"
            placeholder="Madrid"
            className="bg-gray-900 border-gray-700 text-white placeholder-gray-500"
          />
          {errors.city && (
            <p className="text-sm text-red-400 mt-1">{errors.city.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="country" className="text-gray-300">País</Label>
          <Input
            {...register('country')}
            id="country"
            placeholder="España"
            className="bg-gray-900 border-gray-700 text-white placeholder-gray-500"
          />
          {errors.country && (
            <p className="text-sm text-red-400 mt-1">{errors.country.message}</p>
          )}
        </div>
      </div>

      {/* Specializations */}
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

      {/* Social links */}
      <SocialLinksFields register={register} errors={errors} />

      {/* Submit error */}
      {submitError && (
        <div className="p-3 rounded-md bg-red-900/10 border border-red-400/30">
          <p className="text-sm text-red-400">{submitError}</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 justify-end pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isSubmitting}
          className="text-gray-300 hover:text-white hover:bg-gray-700"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  );
}

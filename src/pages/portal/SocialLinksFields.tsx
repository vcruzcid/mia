import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ProfileEditFormData } from '@/schemas/portalSchema';

interface SocialLinksFieldsProps {
  register: UseFormRegister<ProfileEditFormData>;
  errors: FieldErrors<ProfileEditFormData>;
}

export function SocialLinksFields({ register, errors }: SocialLinksFieldsProps) {
  return (
    <div className="space-y-3">
      <Label className="text-gray-300">Redes y web</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="linkedin" className="text-xs text-gray-400">LinkedIn (URL)</Label>
          <Input
            {...register('socialLinks.linkedin')}
            id="linkedin"
            type="url"
            placeholder="https://linkedin.com/in/tu-perfil"
            className="bg-gray-900 border-gray-700 text-white placeholder-gray-500"
          />
          {errors.socialLinks?.linkedin && (
            <p className="text-sm text-red-400 mt-1">{errors.socialLinks.linkedin.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="website" className="text-xs text-gray-400">Sitio web (URL)</Label>
          <Input
            {...register('socialLinks.website')}
            id="website"
            type="url"
            placeholder="https://tu-portfolio.com"
            className="bg-gray-900 border-gray-700 text-white placeholder-gray-500"
          />
          {errors.socialLinks?.website && (
            <p className="text-sm text-red-400 mt-1">{errors.socialLinks.website.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="instagram" className="text-xs text-gray-400">Instagram (usuario)</Label>
          <Input
            {...register('socialLinks.instagram')}
            id="instagram"
            placeholder="@tu_usuario"
            className="bg-gray-900 border-gray-700 text-white placeholder-gray-500"
          />
          {errors.socialLinks?.instagram && (
            <p className="text-sm text-red-400 mt-1">{errors.socialLinks.instagram.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="twitter" className="text-xs text-gray-400">Twitter / X (usuario)</Label>
          <Input
            {...register('socialLinks.twitter')}
            id="twitter"
            placeholder="@tu_usuario"
            className="bg-gray-900 border-gray-700 text-white placeholder-gray-500"
          />
          {errors.socialLinks?.twitter && (
            <p className="text-sm text-red-400 mt-1">{errors.socialLinks.twitter.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}

import { z } from 'zod';
import { ANIMATION_SPECIALIZATIONS } from '@/types';

export const loginSchema = z.object({
  email: z.string().email('Introduce un email válido'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

const urlOrEmpty = z.string().url('Introduce una URL válida').or(z.literal(''));
const handleOrEmpty = z.string().max(60, 'El usuario no puede superar 60 caracteres').or(z.literal(''));

export const profileEditSchema = z.object({
  firstName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede superar 50 caracteres'),
  lastName: z
    .string()
    .min(2, 'Los apellidos deben tener al menos 2 caracteres')
    .max(100, 'Los apellidos no pueden superar 100 caracteres'),
  bio: z.string().max(1000, 'La biografía no puede superar 1000 caracteres').or(z.literal('')),
  city: z.string().max(100, 'La ciudad no puede superar 100 caracteres').or(z.literal('')),
  country: z.string().max(100, 'El país no puede superar 100 caracteres').or(z.literal('')),
  specializations: z
    .array(z.enum([...ANIMATION_SPECIALIZATIONS] as [string, ...string[]]))
    .max(10, 'No puedes seleccionar más de 10 especialidades'),
  socialLinks: z.object({
    linkedin: urlOrEmpty.optional().default(''),
    instagram: handleOrEmpty.optional().default(''),
    twitter: handleOrEmpty.optional().default(''),
    website: urlOrEmpty.optional().default(''),
  }),
});

export type ProfileEditFormData = z.infer<typeof profileEditSchema>;

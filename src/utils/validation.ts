import { z } from 'zod';

export const membershipFormSchema = z.object({
  firstName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres'),
  lastName: z
    .string()
    .min(2, 'Los apellidos deben tener al menos 2 caracteres')
    .max(50, 'Los apellidos no pueden exceder 50 caracteres'),
  email: z
    .string()
    .email('Introduce un email válido')
    .min(5, 'El email debe tener al menos 5 caracteres'),
  phone: z
    .string()
    .transform(val => val.replace(/[\s\-().]/g, ''))
    .pipe(
      z.string().regex(/^(\+34|0034|34)?[6789]\d{8}$/, 'Introduce un número de teléfono español válido')
    )
    .optional()
    .or(z.literal('')),
  membershipType: z
    .string()
    .min(1, 'Selecciona un tipo de membresía'),
  acceptTerms: z
    .boolean()
    .refine(val => val === true, 'Debes aceptar los términos y condiciones'),
  acceptNewsletter: z.boolean()
});

export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  email: z
    .string()
    .email('Introduce un email válido'),
  subject: z
    .string()
    .min(5, 'El asunto debe tener al menos 5 caracteres')
    .max(200, 'El asunto no puede exceder 200 caracteres'),
  message: z
    .string()
    .min(10, 'El mensaje debe tener al menos 10 caracteres')
    .max(1000, 'El mensaje no puede exceder 1000 caracteres'),
  turnstileToken: z.string().optional()
});

export type MembershipFormData = z.infer<typeof membershipFormSchema>;
export type ContactFormData = z.infer<typeof contactFormSchema>;
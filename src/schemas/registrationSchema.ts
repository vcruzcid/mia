import { z } from 'zod';
import { ANIMATION_SPECIALIZATIONS } from '../types';

// Phone validation for Spanish numbers
const spanishPhoneRegex = /^(\+34|0034|34)?[6789]\d{8}$/;

// Professional categories based on animation specializations
export const PROFESSIONAL_CATEGORIES = ANIMATION_SPECIALIZATIONS;

// Universities in Spain (sample list - can be extended)
export const SPANISH_UNIVERSITIES = [
  'Universidad Complutense de Madrid',
  'Universidad Autónoma de Barcelona',
  'Universidad Politécnica de Valencia',
  'Universidad del País Vasco',
  'Universidad de Barcelona',
  'Universidad Politécnica de Madrid',
  'Universidad de Valencia',
  'Universidad de Sevilla',
  'Universidad de Granada',
  'Universidad de Málaga',
  'ESCAC (Escola Superior de Cinema i Audiovisuals de Catalunya)',
  'Universidad Rey Juan Carlos',
  'CEU San Pablo',
  'Universidad Francisco de Vitoria',
  'Universidad Europea de Madrid',
  'ESDIP (Escola Superior de Disseny i Arts Plàstiques)',
  'Otra universidad',
] as const;

// Discount codes for special offers
export const VALID_DISCOUNT_CODES = {
  'DIRECTIVA2024': { percentage: 50, description: 'Descuento para miembros de directiva' },
  'ESTUDIANTE25': { percentage: 25, description: 'Descuento estudiantes' },
  'EARLYBIRD': { percentage: 15, description: 'Descuento madrugador' },
  'AMIGA10': { percentage: 10, description: 'Descuento por recomendación' },
} as const;

// Step 1: Personal Information Schema
export const personalInfoSchema = z.object({
  firstName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s'-]+$/, 'El nombre contiene caracteres no válidos'),
  
  lastName: z
    .string()
    .min(2, 'Los apellidos deben tener al menos 2 caracteres')
    .max(100, 'Los apellidos no pueden exceder 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s'-]+$/, 'Los apellidos contienen caracteres no válidos'),
  
  email: z
    .string()
    .email('Por favor, introduce un email válido')
    .max(255, 'El email no puede exceder 255 caracteres')
    .toLowerCase(),
  
  phone: z
    .string()
    .transform(phone => {
      // Strip spaces, dashes, dots, and parentheses before validation
      return phone.replace(/[\s\-().]/g, '');
    })
    .pipe(
      z.string()
        .regex(spanishPhoneRegex, 'Por favor, introduce un teléfono español válido (ej: +34 666 123 456)')
    )
    .transform(phone => {
      // Normalize phone format to +34 prefix
      if (phone.startsWith('+34')) return phone;
      if (phone.startsWith('0034')) return '+34' + phone.slice(4);
      if (phone.startsWith('34')) return '+34' + phone.slice(2);
      return '+34' + phone;
    }),
  
  address: z.object({
    street: z.string().min(5, 'La dirección debe tener al menos 5 caracteres').max(255),
    city: z.string().min(2, 'La ciudad debe tener al menos 2 caracteres').max(100),
    postalCode: z
      .string()
      .regex(/^\d{5}$/, 'El código postal debe tener 5 dígitos')
      .length(5, 'El código postal debe tener exactamente 5 dígitos'),
    province: z.string().min(2, 'La provincia es requerida').max(100),
    country: z.string().default('España'),
  }),
  
  categories: z
    .array(z.string())
    .min(1, 'Selecciona al menos una categoría profesional')
    .max(10, 'No puedes seleccionar más de 10 categorías')
    .refine(
      (categories) => categories.every(cat => PROFESSIONAL_CATEGORIES.includes(cat as (typeof PROFESSIONAL_CATEGORIES)[number])),
      'Una o más categorías no son válidas'
    ),
  
  university: z.string().optional(),
});

// Step 2: Membership & Payment Schema
export const membershipPaymentSchema = z.object({
  membershipType: z.enum(['pleno-derecho', 'estudiante', 'colaborador', 'newsletter']).refine(
    (val) => val !== undefined,
    { message: 'Selecciona un tipo de membresía' }
  ),
  
  discountCode: z
    .string()
    .optional()
    .refine(
      (code) => !code || Object.keys(VALID_DISCOUNT_CODES).includes(code),
      'Código de descuento no válido'
    ),
  
  termsAccepted: z
    .boolean()
    .refine(val => val === true, 'Debes aceptar los términos y condiciones'),
  
  gdprConsent: z
    .boolean()
    .refine(val => val === true, 'Debes aceptar el tratamiento de tus datos personales'),
  
  marketingConsent: z.boolean().default(false),
  
  paymentMethod: z.enum(['stripe', 'bank_transfer']).optional(),
});

// Step 3: Profile Details Schema  
export const profileDetailsSchema = z.object({
  bio: z
    .string()
    .max(1000, 'La biografía no puede exceder 1000 caracteres')
    .optional(),
  
  company: z
    .string()
    .max(100, 'El nombre de la empresa no puede exceder 100 caracteres')
    .optional(),
  
  position: z
    .string()
    .max(100, 'El cargo no puede exceder 100 caracteres')
    .optional(),
  
  experience: z.enum(['junior', 'mid', 'senior', 'lead', 'director', 'freelance', 'student']).refine(
    (val) => val !== undefined,
    { message: 'Selecciona tu nivel de experiencia' }
  ),
  
  socialMedia: z.object({
    website: z
      .string()
      .url('Introduce una URL válida')
      .optional()
      .or(z.literal('')),
    linkedin: z
      .string()
      .url('Introduce una URL válida de LinkedIn')
      .optional()
      .or(z.literal('')),
    twitter: z
      .string()
      .optional()
      .or(z.literal(''))
      .refine(
        (val) => !val || val.match(/^@?[\w]+$/),
        'Introduce un usuario válido de Twitter (ej: @usuario o usuario)'
      )
      .transform((val) => val ? (val.startsWith('@') ? val : `@${val}`) : val),
    instagram: z
      .string()
      .optional()
      .or(z.literal(''))
      .refine(
        (val) => !val || val.match(/^@?[\w.]+$/),
        'Introduce un usuario válido de Instagram (ej: @usuario o usuario)'
      )
      .transform((val) => val ? (val.startsWith('@') ? val : `@${val}`) : val),
    behance: z
      .string()
      .url('Introduce una URL válida de Behance')
      .optional()
      .or(z.literal('')),
    artstation: z
      .string()
      .url('Introduce una URL válida de ArtStation')
      .optional()
      .or(z.literal('')),
  }),
  
  profileImage: z
    .object({
      file: z.instanceof(File).optional(),
      preview: z.string().optional(),
    })
    .optional(),
  
  galleryVisibility: z.object({
    showProfile: z.boolean().default(true),
    showContact: z.boolean().default(true),
    showSocialMedia: z.boolean().default(true),
    showProjects: z.boolean().default(false),
  }),
  
  preferences: z.object({
    newsletterFrequency: z.enum(['weekly', 'monthly', 'quarterly']).default('monthly'),
    eventNotifications: z.boolean().default(true),
    jobNotifications: z.boolean().default(true),
    whatsappCommunity: z.boolean().default(false),
    mentorshipProgram: z.boolean().default(false),
  }),
});

// Complete Registration Schema (all steps combined)
export const registrationSchema = personalInfoSchema
  .merge(membershipPaymentSchema)
  .merge(profileDetailsSchema)
  .refine(
    (data) => {
      // University is required for students
      if (data.membershipType === 'estudiante') {
        return data.university && data.university.length > 0;
      }
      return true;
    },
    {
      message: 'La universidad es requerida para socias estudiantes',
      path: ['university'],
    }
  )
  .refine(
    (data) => {
      // Payment method required for paid memberships
      if (['pleno-derecho', 'estudiante', 'colaborador'].includes(data.membershipType)) {
        return data.paymentMethod !== undefined;
      }
      return true;
    },
    {
      message: 'Método de pago requerido para membresías de pago',
      path: ['paymentMethod'],
    }
  );

// Export types
export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;
export type MembershipPaymentFormData = z.infer<typeof membershipPaymentSchema>;
export type ProfileDetailsFormData = z.infer<typeof profileDetailsSchema>;
export type RegistrationFormData = z.infer<typeof registrationSchema>;

// Step validation schemas for individual form steps
export const stepSchemas = {
  1: personalInfoSchema,
  2: membershipPaymentSchema,
  3: profileDetailsSchema,
} as const;

// Helper function to calculate discounted price
export function calculateDiscountedPrice(originalPrice: number, discountCode?: string): {
  originalPrice: number;
  discountPercentage: number;
  discountAmount: number;
  finalPrice: number;
  isValid: boolean;
} {
  if (!discountCode || !VALID_DISCOUNT_CODES[discountCode as keyof typeof VALID_DISCOUNT_CODES]) {
    return {
      originalPrice,
      discountPercentage: 0,
      discountAmount: 0,
      finalPrice: originalPrice,
      isValid: false,
    };
  }

  const discount = VALID_DISCOUNT_CODES[discountCode as keyof typeof VALID_DISCOUNT_CODES];
  const discountAmount = Math.round((originalPrice * discount.percentage) / 100);
  const finalPrice = originalPrice - discountAmount;

  return {
    originalPrice,
    discountPercentage: discount.percentage,
    discountAmount,
    finalPrice: Math.max(0, finalPrice), // Ensure price doesn't go negative
    isValid: true,
  };
}

// Helper function to validate step
export function validateStep(step: 1 | 2 | 3, data: unknown): { success: boolean; errors?: unknown } {
  try {
    stepSchemas[step].parse(data);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.flatten() };
    }
    return { success: false, errors: { general: 'Error de validación desconocido' } };
  }
}
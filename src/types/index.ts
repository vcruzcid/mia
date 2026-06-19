export interface MembershipType {
  id: string;
  name: string;
  description: string;
  price: number;
  benefits: string[];
}

export interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  membershipType: string;
  acceptTerms: boolean;
  acceptNewsletter: boolean;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  turnstileToken?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// NOTE: The gallery Member type lives in `@/types/member` — import it from there.
// The previous duplicate definition here (and the unused FilterState/GalleryState)
// were removed; the live gallery uses the WildApricot-shaped Member in member.ts.

// Animation profession categories constants
export const ANIMATION_SPECIALIZATIONS = [
  'Guión',
  'Dirección',
  'Storyboard',
  'Dirección de arte',
  'Concept Art',
  'Diseño de personajes',
  'Diseño de sets',
  'Visual Development',
  'Modelado 3D',
  'Motion Graphics',
  'Layout 2D',
  'Layout 3D',
  'Color BG',
  'Rigging 2D',
  'Rigging 3D',
  'Animación 2D',
  '2D FX',
  'Clean Up',
  'Ink and Paint',
  'Animación 3D',
  'Animación StopMotion',
  'Artista para Stopmotion',
  'Composición Digital',
  'Sonido/ Música/ SFX',
  'Montaje',
  'Pipeline',
  'Producción',
  'Asistente de producción',
  'Directora de producción',
  'Coordinadora de producción',
  'Line producer',
  'Producción ejecutiva',
  'Matte painting',
  'Render wrangler',
  'Lighting',
  'Shading',
  'Marketing',
  'Groom artist',
  'Compositora musical'
] as const;

export type AnimationSpecialization = typeof ANIMATION_SPECIALIZATIONS[number];

// Router location state types
export interface LocationState {
  from?: {
    pathname: string;
  };
}
// Environment-based configuration
const isDev = import.meta.env.DEV || window.location.hostname === 'dev.animacionesmia.com';

export const siteConfig = {
  name: 'Mujeres en la Industria de Animación',
  shortName: 'MIA',
  description: 'Asociación profesional de mujeres en la industria de animación en España',
  url: isDev ? 'https://dev.animacionesmia.com' : 'https://animacionesmia.com',
  turnstile: {
    sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined
  },
} as const;

export type SiteConfig = typeof siteConfig;
// Environment-based configuration
const isDev = import.meta.env.DEV || window.location.hostname === 'dev.animacionesmia.com';

export const siteConfig = {
  name: 'Mujeres en la Industria de Animación',
  shortName: 'MIA',
  description: 'Asociación profesional de mujeres en la industria de animación en España',
  url: isDev ? 'https://dev.animacionesmia.com' : 'https://animacionesmia.com',
  // WildApricot-hosted pages handle membership signup, member login/portal and
  // contact — the app links out to these instead of running its own flows.
  wildApricot: {
    signupUrl: 'https://web.animacionesmia.com/iniciar-membresia',
    loginUrl: 'https://web.animacionesmia.com/portal-login',
    contactUrl: 'https://web.animacionesmia.com/contacto',
  },
} as const;

export type SiteConfig = typeof siteConfig;
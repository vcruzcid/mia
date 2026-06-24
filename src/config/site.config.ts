// Environment-based configuration
const isDev = import.meta.env.DEV || window.location.hostname === 'dev.animacionesmia.com';

export const siteConfig = {
  name: 'Mujeres en la Industria de Animación',
  shortName: 'MIA',
  description: 'Asociación profesional de mujeres en la industria de animación en España',
  url: isDev ? 'https://dev.animacionesmia.com' : 'https://animacionesmia.com',
  // WildApricot-hosted pages for member login/portal and contact. Membership
  // signup is handled in-app on /membresia (embedded WildApricot widget), so
  // there's no external signup URL here.
  wildApricot: {
    loginUrl: 'https://web.animacionesmia.com/Sys/Login',
    contactUrl: 'https://web.animacionesmia.com/contacto',
  },
} as const;

export type SiteConfig = typeof siteConfig;
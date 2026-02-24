// Environment-based configuration
const isDev = import.meta.env.DEV || window.location.hostname === 'dev.animacionesmia.com';

export const siteConfig = {
  name: 'Mujeres en la Industria de Animación',
  shortName: 'MIA',
  description: 'Asociación profesional de mujeres en la industria de animación en España',
  url: isDev ? 'https://dev.animacionesmia.com' : 'https://animacionesmia.com',
  turnstile: {
    sitekey: '0x4AAAAAABddjw-SDSpgjBDI'
  },
  analytics: {
    gtag: 'G-YLBF3GWPRV'
  },
  mailchimp: {
    listIds: {
      socias: '300',
      freeMembers: '301'
    }
  }
} as const;

export type SiteConfig = typeof siteConfig;
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
  stripe: {
    // Use test mode links in development, production links in production
    plenoDerecho: isDev
      ? 'https://pagos.animacionesmia.com/b/test_7sYcN4gOg2Sz5ju2Hd7g400'
      : 'https://pagos.animacionesmia.com/b/9B69ASapSeBh13e81x7g401',
    estudiante: isDev
      ? 'https://pagos.animacionesmia.com/b/test_00w28qcy0gJp27i3Lh7g402'
      : 'https://pagos.animacionesmia.com/b/00w28qcy0gJp27i3Lh7g402',
    colaborador: isDev
      ? 'https://pagos.animacionesmia.com/b/test_9B69ASapSeBh13e81x7g401'
      : 'https://pagos.animacionesmia.com/b/9B65kC41ubp5eU495B7g403Og2Sz5ju2Hd7g400'
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
export const siteConfig = {
  name: 'Mujeres en la Industria de Animación',
  shortName: 'MIA',
  description: 'Asociación profesional de mujeres en la industria de animación en España',
  url: 'https://animacionesmia.com',
  turnstile: {
    sitekey: '0x4AAAAAABddjw-SDSpgjBDI'
  },
  stripe: {
    plenoDerecho: 'https://pagos.animacionesmia.com/b/9B69ASapSeBh13e81x7g401',
    estudiante: 'https://pagos.animacionesmia.com/b/00w28qcy0gJp27i3Lh7g402',
    colaborador: 'https://pagos.animacionesmia.com/b/9B65kC41ubp5eU495B7g403Og2Sz5ju2Hd7g400'
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
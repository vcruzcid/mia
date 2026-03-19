import type { CookieConsentConfig } from 'vanilla-cookieconsent';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

const GA_ID = 'G-YLBF3GWPRV';

function enableGA(): void {
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);
  window.gtag('consent', 'update', { analytics_storage: 'granted' });
  window.gtag('js', new Date());
  window.gtag('config', GA_ID);
}

function disableGA(): void {
  window.gtag('consent', 'update', { analytics_storage: 'denied' });
}

export const cookieConsentConfig: CookieConsentConfig = {
  onFirstConsent: ({ cookie }) => {
    if (cookie.categories.includes('analytics')) enableGA();
  },

  onChange: ({ cookie, changedCategories }) => {
    if (!changedCategories.includes('analytics')) return;
    if (cookie.categories.includes('analytics')) {
      enableGA();
    } else {
      disableGA();
    }
  },

  categories: {
    necessary: {
      enabled: true,
      readOnly: true,
    },
    functional: {},
    analytics: {
      autoClear: {
        cookies: [
          { name: /^_ga/ },
          { name: '_gid' },
        ],
      },
    },
  },

  language: {
    default: 'es',
    translations: {
      es: {
        consentModal: {
          title: 'Usamos cookies',
          description:
            'Utilizamos cookies para garantizar el funcionamiento de la web y, con tu consentimiento, para analizar el tráfico. Puedes gestionar tus preferencias en cualquier momento.',
          acceptAllBtn: 'Aceptar todas',
          acceptNecessaryBtn: 'Solo necesarias',
          showPreferencesBtn: 'Gestionar preferencias',
        },
        preferencesModal: {
          title: 'Preferencias de cookies',
          acceptAllBtn: 'Aceptar todas',
          acceptNecessaryBtn: 'Solo necesarias',
          savePreferencesBtn: 'Guardar preferencias',
          closeIconLabel: 'Cerrar',
          sections: [
            {
              title: 'Cookies necesarias',
              description:
                'Imprescindibles para el funcionamiento de la web. Incluyen la protección anti-bots de Cloudflare Turnstile. No se pueden desactivar.',
              linkedCategory: 'necessary',
            },
            {
              title: 'Cookies funcionales',
              description:
                'Permiten recordar tus preferencias y mantener tu sesión en el portal de socias.',
              linkedCategory: 'functional',
            },
            {
              title: 'Cookies de análisis',
              description:
                'Nos ayudan a entender cómo se utiliza la web mediante Google Analytics 4. Solo se activan con tu consentimiento.',
              linkedCategory: 'analytics',
              cookieTable: {
                headers: { name: 'Cookie', domain: 'Dominio', desc: 'Descripción' },
                body: [
                  { name: '_ga', domain: 'google.com', desc: 'Identifica usuarios únicos (2 años)' },
                  { name: '_ga_*', domain: 'google.com', desc: 'Almacena el estado de sesión (2 años)' },
                  { name: '_gid', domain: 'google.com', desc: 'Distingue usuarios (24 horas)' },
                ],
              },
            },
          ],
        },
      },
    },
  },
};

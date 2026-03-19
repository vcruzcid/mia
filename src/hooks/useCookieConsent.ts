import { useEffect } from 'react';
import * as CookieConsent from 'vanilla-cookieconsent';
import { cookieConsentConfig } from '@/lib/cookieconsent-config';

export function useCookieConsent(): void {
  useEffect(() => {
    if (!document.getElementById('cc-brand-overrides')) {
      const style = document.createElement('style');
      style.id = 'cc-brand-overrides';
      style.textContent =
        '#cc-main { --cc-btn-primary-bg: #d8242e; --cc-btn-primary-hover-bg: #b01f28; --cc-toggle-on-bg: #d8242e; }';
      document.head.appendChild(style);
    }
    CookieConsent.run(cookieConsentConfig);
  }, []);
}

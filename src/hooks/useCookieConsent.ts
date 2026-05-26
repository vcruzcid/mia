import { useEffect } from 'react';
import * as CookieConsent from 'vanilla-cookieconsent';
import { cookieConsentConfig } from '@/lib/cookieconsent-config';

let isRunningOrInitialized = false;

export function useCookieConsent(): void {
  useEffect(() => {
    // Expose to window for console debugging
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).CookieConsent = CookieConsent;

    // Prevent double running in Strict Mode or re-running if elements already exist
    if (isRunningOrInitialized || document.getElementById('cc-main')) {
      return;
    }

    isRunningOrInitialized = true;

    if (!document.getElementById('cc-brand-overrides')) {
      const style = document.createElement('style');
      style.id = 'cc-brand-overrides';
      style.textContent =
        '#cc-main { --cc-btn-primary-bg: #d8242e; --cc-btn-primary-hover-bg: #b01f28; --cc-toggle-on-bg: #d8242e; }';
      document.head.appendChild(style);
    }

    // Reset library state to clear any stale _ccRun flag, then run
    CookieConsent.reset(false);
    CookieConsent.run(cookieConsentConfig);
  }, []);
}

import { useCallback, useRef, useState } from 'react';
import { siteConfig } from '@/config/site.config';

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string;
          execution?: 'execute' | 'render';
          appearance?: 'always' | 'execute' | 'interaction-only' | 'never';
          callback: (token: string) => void;
          'expired-callback': () => void;
        }
      ) => string;
      execute: (widgetId: string) => void;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

type TurnstileMode = 'execute' | 'render';

interface UseTurnstileReturn {
  containerRef: (node: HTMLDivElement | null) => void;
  token: string;
  execute: () => void;
  resetWidget: () => void;
}

/**
 * Manages a Cloudflare Turnstile widget.
 *
 * Uses a callback ref so it correctly handles conditionally-rendered containers
 * (mounts/unmounts). Polls until window.turnstile is available, resolving the
 * race condition with the async-loaded Turnstile script.
 *
 * @param mode 'execute' — deferred challenge, call execute() manually on submit.
 *             'render' — challenge runs automatically on widget mount.
 */
export function useTurnstile(mode: TurnstileMode = 'render'): UseTurnstileReturn {
  const [token, setToken] = useState('');
  const widgetIdRef = useRef<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const containerRef = useCallback(
    (node: HTMLDivElement | null) => {
      // Cleanup any in-progress polling and existing widget
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (widgetIdRef.current) {
        window.turnstile?.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }

      if (!node) return;

      const sitekey = siteConfig.turnstile.sitekey;
      if (!sitekey) {
        console.error('[useTurnstile] VITE_TURNSTILE_SITE_KEY is undefined. Add it to .env.development.local for local dev.');
        return;
      }

      const mount = (): boolean => {
        if (!window.turnstile) return false;
        widgetIdRef.current = window.turnstile.render(node, {
          sitekey,
          ...(mode === 'execute' ? { execution: 'execute' } : {}),
          callback: (t: string) => setToken(t),
          'expired-callback': () => setToken(''),
        });
        return true;
      };

      if (!mount()) {
        // Script not loaded yet — poll until available (resolves async/defer race)
        intervalRef.current = setInterval(() => {
          if (mount()) {
            clearInterval(intervalRef.current!);
            intervalRef.current = null;
          }
        }, 100);
      }
    },
    [mode]
  );

  const execute = () => {
    if (widgetIdRef.current) {
      window.turnstile?.execute(widgetIdRef.current);
    }
  };

  const resetWidget = (): void => {
    if (widgetIdRef.current) {
      window.turnstile?.reset(widgetIdRef.current);
    }
    setToken('');
  };

  return { containerRef, token, execute, resetWidget };
}

import { useEffect, useRef, useState } from 'react';
import { siteConfig } from '@/config/site.config';

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
}

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: {
        sitekey: string;
        callback: (token: string) => void;
        'error-callback'?: () => void;
        'expired-callback'?: () => void;
        theme?: 'light' | 'dark' | 'auto';
        size?: 'normal' | 'compact';
      }) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId: string) => void;
    };
  }
}

/**
 * TurnstileWidget - Cloudflare Turnstile CAPTCHA Component
 *
 * Loads and renders Cloudflare Turnstile for bot protection.
 * Used before showing registration widget to prevent bot abuse.
 *
 * @param onVerify - Callback when user successfully completes verification
 * @param onError - Optional callback when verification fails
 * @param onExpire - Optional callback when verification expires
 */
export function TurnstileWidget({ onVerify, onError, onExpire }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let scriptElement: HTMLScriptElement | null = null;

    const loadTurnstile = () => {
      // Check if script already loaded
      if (window.turnstile) {
        renderWidget();
        return;
      }

      // Load Turnstile script
      scriptElement = document.createElement('script');
      scriptElement.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      scriptElement.async = true;
      scriptElement.defer = true;
      scriptElement.onload = () => {
        setIsLoading(false);
        renderWidget();
      };
      scriptElement.onerror = () => {
        setIsLoading(false);
        onError?.();
      };
      document.head.appendChild(scriptElement);
    };

    const renderWidget = () => {
      if (!containerRef.current || !window.turnstile) return;

      try {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteConfig.turnstile.sitekey,
          callback: (token: string) => {
            onVerify(token);
          },
          'error-callback': () => {
            onError?.();
          },
          'expired-callback': () => {
            onExpire?.();
          },
          theme: 'light',
          size: 'normal',
        });
      } catch (error) {
        console.error('Turnstile render error:', error);
        onError?.();
      }
    };

    loadTurnstile();

    // Cleanup
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (error) {
          console.error('Turnstile cleanup error:', error);
        }
      }
      if (scriptElement && scriptElement.parentNode) {
        scriptElement.parentNode.removeChild(scriptElement);
      }
    };
  }, [onVerify, onError, onExpire]);

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {isLoading && (
        <p className="text-sm text-gray-600">Cargando verificación de seguridad...</p>
      )}
      <div ref={containerRef} className="w-full flex justify-center" />
    </div>
  );
}

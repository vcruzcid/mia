import { useEffect } from 'react';

// Official WildApricot membership-signup widget, embedded so members can join
// without leaving the app. The iframe is cross-origin (we can't auto-size it to
// its content), so it uses a generous fixed height and the widget scrolls
// internally if its form is taller. EnableCookies.js is WildApricot's helper
// that lets their session cookies work inside the iframe; the iframe's onLoad
// invokes it (replacing the raw onload="" attribute from WA's snippet).

const WA_ORIGIN = 'https://web.animacionesmia.com';
const WIDGET_SRC = `${WA_ORIGIN}/widget/iniciar-membresia`;
const COOKIES_SCRIPT = `${WA_ORIGIN}/Common/EnableCookies.js`;

declare global {
  interface Window {
    tryToEnableWACookies?: (origin: string) => void;
  }
}

export function WildApricotMembershipWidget() {
  // Load WildApricot's cookie helper once (it defines tryToEnableWACookies).
  useEffect(() => {
    if (document.querySelector(`script[src="${COOKIES_SCRIPT}"]`)) return;
    const script = document.createElement('script');
    script.src = COOKIES_SCRIPT;
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Match the page background (bg-gray-900 = #111827) so the iframe area
          blends with the membership page. Pair this with WA-side CSS that sets
          the widget's own background to the same colour. */}
      <iframe
        title="Iniciar membresía en MIA"
        src={WIDGET_SRC}
        className="block w-full border-0"
        style={{ height: '720px', backgroundColor: '#111827' }}
        allow="payment"
        onLoad={() => window.tryToEnableWACookies?.(WA_ORIGIN)}
      />
      <p className="mt-2 text-center text-[10px] text-gray-500">
        Gestionado por Wild Apricot{' '}
        <a
          href="http://www.wildapricot.com/features"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-400"
        >
          Membership Software
        </a>
      </p>
    </div>
  );
}

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface MagicLinkSentStepProps {
  magicLink: string;
  isSubmitting: boolean;
  onBack: () => void;
}

export function MagicLinkSentStep({ magicLink, isSubmitting, onBack }: MagicLinkSentStepProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(magicLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available — user can copy from the link button
    }
  };

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-900/20 border border-green-400/30">
          <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="mt-2 text-lg font-medium text-white">Enlace generado</h3>
        <p className="mt-1 text-sm text-gray-300">
          Tu enlace de acceso es válido durante 15 minutos.
        </p>
      </div>

      <a
        href={magicLink}
        className="block w-full text-center py-3 px-4 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium transition-colors text-sm"
      >
        Acceder al portal
      </a>

      <Button
        variant="ghost"
        onClick={() => void handleCopy()}
        className="w-full border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
      >
        {copied ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Enlace copiado
          </span>
        ) : (
          'Copiar enlace'
        )}
      </Button>

      <div className="flex flex-col gap-2 text-center">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="text-sm text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
        >
          Solicitar nuevo enlace
        </button>
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
        >
          Usar otro correo electrónico
        </button>
      </div>
    </div>
  );
}

import { Turnstile } from '@marsidev/react-turnstile';
import { getApiConfig } from '../services/apiService';

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  className?: string;
}

export function TurnstileWidget({ onSuccess, onError, onExpire, className }: TurnstileWidgetProps) {
  const { turnstileSiteKey } = getApiConfig();

  return (
    <div className={className}>
      <Turnstile
        siteKey={turnstileSiteKey}
        onSuccess={onSuccess}
        onError={onError}
        onExpire={onExpire}
        options={{
          theme: 'dark',
          size: 'normal',
          action: 'submit-form',
          cData: 'mia-form-verification',
        }}
      />
    </div>
  );
}
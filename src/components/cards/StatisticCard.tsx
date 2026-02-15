import React from 'react';

interface StatisticCardProps {
  value: string;
  label: string;
  delay?: string;
  isIntersecting?: boolean;
}

export const StatisticCard = React.memo(
  ({ value, label, delay = '0ms', isIntersecting = true }: StatisticCardProps) => (
    <div
      className={`text-center transition-all duration-1000 ${
        isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: delay }}
    >
      <div className="text-4xl font-bold" style={{ color: 'var(--color-primary)' }}>
        {value}
      </div>
      <div className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>
        {label}
      </div>
    </div>
  ),
  (prevProps, nextProps) => {
    // Custom comparison for memoization
    return (
      prevProps.value === nextProps.value &&
      prevProps.label === nextProps.label &&
      prevProps.delay === nextProps.delay &&
      prevProps.isIntersecting === nextProps.isIntersecting
    );
  }
);

StatisticCard.displayName = 'StatisticCard';

import React from 'react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: string;
  isIntersecting?: boolean;
}

export const FeatureCard = React.memo(
  ({ icon, title, description, delay = '0ms', isIntersecting = true }: FeatureCardProps) => (
    <div
      className={`relative group hover:scale-105 transition-all duration-300 ${
        isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: delay }}
    >
      <dt>
        <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-red-600 text-white group-hover:bg-red-700 transition-colors duration-300">
          {icon}
        </div>
        <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{title}</p>
      </dt>
      <dd className="mt-2 ml-16 text-base text-gray-500">{description}</dd>
    </div>
  ),
  (prevProps, nextProps) => {
    // Custom comparison for memoization
    return (
      prevProps.title === nextProps.title &&
      prevProps.description === nextProps.description &&
      prevProps.delay === nextProps.delay &&
      prevProps.isIntersecting === nextProps.isIntersecting
    );
  }
);

FeatureCard.displayName = 'FeatureCard';

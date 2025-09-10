import { useState } from 'react';

interface ProfileImageProps {
  src?: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-20 w-20',
  xl: 'h-24 w-24'
};

export function ProfileImage({ 
  src, 
  alt, 
  size = 'md', 
  className = '' 
}: ProfileImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(!!src);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const baseClasses = `${sizeClasses[size]} rounded-full object-cover bg-gray-100`;
  const combinedClasses = `${baseClasses} ${className}`;

  if (!src || hasError) {
    return (
      <img
        className={combinedClasses}
        src="/avatar-placeholder.jpg"
        alt={alt}
        loading="lazy"
      />
    );
  }

  return (
    <>
      {isLoading && (
        <div className={`${combinedClasses} animate-pulse bg-gray-200`} />
      )}
      <img
        className={`${combinedClasses} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        src={src}
        alt={alt}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
      />
    </>
  );
}
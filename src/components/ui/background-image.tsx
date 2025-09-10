import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface BackgroundImageProps {
  imageUrl: string;
  children: React.ReactNode;
  className?: string;
  overlayClassName?: string;
}

export const BackgroundImage = forwardRef<HTMLDivElement, BackgroundImageProps>(({ 
  imageUrl, 
  children, 
  className = "",
  overlayClassName = ""
}, ref) => {
  return (
    <div 
      ref={ref}
      className={cn(
        "relative bg-cover bg-center bg-no-repeat",
        className
      )}
      style={{ backgroundImage: `url(${imageUrl})` }}
    >
      {/* Unified Overlay */}
      <div 
        className={cn(
          "absolute inset-0 bg-black/50",
          overlayClassName
        )}
        style={{ backdropFilter: 'blur(5px)' }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
});

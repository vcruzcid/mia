import { useState } from 'react';

interface UseCounterAnimationOptions {
  duration?: number;
  delay?: number;
  start?: number;
  formatter?: (value: number) => string;
}

export function useCounterAnimation(
  target: number,
  options: UseCounterAnimationOptions = {}
) {
  const {
    duration = 2000,
    delay = 0,
    start = 0,
    formatter = (value: number) => Math.floor(value).toString(),
  } = options;
  
  const [current, setCurrent] = useState(start);
  const [isAnimating, setIsAnimating] = useState(false);

  const startAnimation = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const startTime = Date.now() + delay;
    const difference = target - start;

    const animate = () => {
      const now = Date.now();
      const elapsed = Math.max(0, now - startTime);
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out cubic)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const value = start + (difference * easeOut);
      
      setCurrent(value);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        setCurrent(target);
      }
    };

    if (delay > 0) {
      setTimeout(() => {
        requestAnimationFrame(animate);
      }, delay);
    } else {
      requestAnimationFrame(animate);
    }
  };

  const reset = () => {
    setCurrent(start);
    setIsAnimating(false);
  };

  return {
    value: current,
    formattedValue: formatter(current),
    startAnimation,
    reset,
    isAnimating,
  };
}
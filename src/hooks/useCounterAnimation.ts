import { useState, useCallback, useRef, useEffect } from 'react';

// Inline motion preference hook
function useMotionPreference() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return { prefersReducedMotion };
}

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
  
  const { prefersReducedMotion } = useMotionPreference();
  const [current, setCurrent] = useState(start);
  const [isAnimating, setIsAnimating] = useState(false);
  const hasAnimatedRef = useRef(false);
  const targetRef = useRef(target);
  const previousTargetRef = useRef(target);

  // Update target ref when target changes
  useEffect(() => {
    const prevTarget = previousTargetRef.current;
    targetRef.current = target;
    
    // If target changed from 0 to a real value, allow re-animation
    if (prevTarget === 0 && target > 0 && hasAnimatedRef.current) {
      // Reset to allow animation with new target
      hasAnimatedRef.current = false;
      setCurrent(start);
    } else if (prevTarget === 0 && target > 0 && !hasAnimatedRef.current) {
      // Just update current if we haven't animated yet
      setCurrent(start);
    }
    previousTargetRef.current = target;
  }, [target, start]);

  const startAnimation = useCallback(() => {
    // Use current target value from ref
    const currentTarget = targetRef.current;
    
    // Don't animate if target is 0 or we're already animating with same target
    if (isAnimating || (hasAnimatedRef.current && currentTarget === previousTargetRef.current && currentTarget > 0)) {
      return;
    }
    
    hasAnimatedRef.current = true;
    setIsAnimating(true);

    // If user prefers reduced motion, skip animation
    if (prefersReducedMotion) {
      setCurrent(currentTarget);
      setIsAnimating(false);
      return;
    }
    const startTime = Date.now() + delay;
    const difference = currentTarget - start;

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
        setCurrent(currentTarget);
      }
    };

    if (delay > 0) {
      setTimeout(() => {
        requestAnimationFrame(animate);
      }, delay);
    } else {
      requestAnimationFrame(animate);
    }
  }, [delay, duration, isAnimating, start, prefersReducedMotion]);

  const reset = useCallback(() => {
    setCurrent(start);
    setIsAnimating(false);
    hasAnimatedRef.current = false;
  }, [start]);

  const formattedValue = useCallback(() => formatter(current), [current, formatter]);

  return {
    value: current,
    formattedValue: formattedValue(),
    startAnimation,
    reset,
    isAnimating,
  };
}
import { useState, useEffect } from 'react'

export function useMotionPreference() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    
    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches)
    
    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }
    
    mediaQuery.addEventListener('change', handleChange)
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return {
    prefersReducedMotion,
    shouldAnimate: !prefersReducedMotion
  }
}

// Utility function to conditionally apply motion classes
export function motionClass(motionClass: string, reduceMotionClass = '') {
  if (typeof window !== 'undefined') {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    return prefersReducedMotion ? reduceMotionClass : motionClass
  }
  return motionClass
}
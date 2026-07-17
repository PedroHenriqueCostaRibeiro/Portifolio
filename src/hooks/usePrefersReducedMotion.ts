import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

const getInitialState = () =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(QUERY).matches
    : false

/**
 * Reflects the user's `prefers-reduced-motion` system setting, updating live
 * if the preference changes at runtime.
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] =
    useState(getInitialState)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return

    const media = window.matchMedia(QUERY)
    const onChange = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches)

    setPrefersReducedMotion(media.matches)
    media.addEventListener('change', onChange)

    return () => media.removeEventListener('change', onChange)
  }, [])

  return prefersReducedMotion
}

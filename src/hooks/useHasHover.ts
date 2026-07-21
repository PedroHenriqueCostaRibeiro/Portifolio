import { useEffect, useState } from 'react'

const QUERY = '(hover: hover) and (pointer: fine)'

const getInitialState = () =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(QUERY).matches
    : false

/**
 * Reflects whether the device has a hover-capable fine pointer (mouse/trackpad),
 * updating live if the input changes (ex.: 2-in-1 acoplado/desacoplado).
 * `false` em touch — onde não há `mousemove` para dirigir o scrub.
 */
export function useHasHover(): boolean {
  const [hasHover, setHasHover] = useState(getInitialState)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return

    const media = window.matchMedia(QUERY)
    const onChange = (e: MediaQueryListEvent) => setHasHover(e.matches)

    setHasHover(media.matches)
    media.addEventListener('change', onChange)

    return () => media.removeEventListener('change', onChange)
  }, [])

  return hasHover
}

import { renderHook, act } from '@testing-library/react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

type ChangeHandler = (e: MediaQueryListEvent) => void

function mockMatchMedia(initialMatches: boolean) {
  let matches = initialMatches
  const handlers = new Set<ChangeHandler>()

  window.matchMedia = vi.fn().mockImplementation(() => ({
    get matches() {
      return matches
    },
    media: '(prefers-reduced-motion: reduce)',
    addEventListener: (_: string, handler: ChangeHandler) => {
      handlers.add(handler)
    },
    removeEventListener: (_: string, handler: ChangeHandler) => {
      handlers.delete(handler)
    },
  }))

  return {
    emitChange(next: boolean) {
      matches = next
      handlers.forEach((handler) =>
        handler({ matches: next } as MediaQueryListEvent),
      )
    },
  }
}

describe('usePrefersReducedMotion', () => {
  it('retorna true quando o sistema prefere movimento reduzido', () => {
    mockMatchMedia(true)
    const { result } = renderHook(() => usePrefersReducedMotion())
    expect(result.current).toBe(true)
  })

  it('retorna false quando não há preferência por movimento reduzido', () => {
    mockMatchMedia(false)
    const { result } = renderHook(() => usePrefersReducedMotion())
    expect(result.current).toBe(false)
  })

  it('reage quando a preferência muda em runtime', () => {
    const media = mockMatchMedia(false)
    const { result } = renderHook(() => usePrefersReducedMotion())
    expect(result.current).toBe(false)

    act(() => media.emitChange(true))
    expect(result.current).toBe(true)
  })
})

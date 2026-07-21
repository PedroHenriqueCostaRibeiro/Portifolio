import { render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import BackgroundVideo from './BackgroundVideo'

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'
const FINE_HOVER = '(hover: hover) and (pointer: fine)'

/** Faz o matchMedia responder de acordo com o dispositivo simulado. */
function mockMatchMedia(matches: (query: string) => boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: matches(query),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia
}

describe('BackgroundVideo', () => {
  let play: ReturnType<typeof vi.fn>

  beforeEach(() => {
    // jsdom não implementa play(); simulamos um autoplay bem-sucedido.
    play = vi.fn().mockResolvedValue(undefined)
    HTMLMediaElement.prototype.play = play as unknown as HTMLMediaElement['play']
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('reproduz em loop no touch (sem hover fino)', () => {
    mockMatchMedia((q) => (q === FINE_HOVER ? false : q === REDUCED_MOTION ? false : false))

    const { container } = render(<BackgroundVideo />)
    const video = container.querySelector('video')!

    expect(play).toHaveBeenCalled()
    expect(video.loop).toBe(true)
  })

  it('não toca com movimento reduzido', () => {
    mockMatchMedia((q) => q === REDUCED_MOTION)

    render(<BackgroundVideo />)

    expect(play).not.toHaveBeenCalled()
  })

  it('não toca automaticamente no desktop (scrub por mouse)', () => {
    mockMatchMedia((q) => q === FINE_HOVER)

    render(<BackgroundVideo />)

    expect(play).not.toHaveBeenCalled()
  })
})

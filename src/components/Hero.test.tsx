import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Hero from './Hero'

const EMAIL = 'pedrohcribeiro75@gmail.com'

/** Faz o matchMedia responder um valor fixo (lido por usePrefersReducedMotion). */
function mockMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia
}

describe('Hero', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockMatchMedia(false)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('copia o e-mail e confirma com "Copiado!" ao clicar na pill de contato', async () => {
    // Clique + Promise do clipboard precisam de tempo real; o próprio userEvent
    // instala um clipboard falso, então lemos de volta o que foi copiado.
    vi.useRealTimers()
    const user = userEvent.setup()
    render(<Hero />)

    await user.click(screen.getByRole('button', { name: /fale comigo/i }))

    expect(await navigator.clipboard.readText()).toBe(EMAIL)
    expect(screen.getByText('Copiado!')).toBeInTheDocument()
  })

  it('as pills entram (fade) cerca de 400ms após o load', () => {
    render(<Hero />)

    const container = screen.getByRole('button', { name: /ver projetos/i })
      .parentElement!
    expect(container.style.opacity).toBe('0')

    act(() => {
      vi.advanceTimersByTime(400)
    })

    expect(container.style.opacity).toBe('1')
  })

  it('com movimento reduzido, as pills aparecem imediatamente', () => {
    mockMatchMedia(true)
    render(<Hero />)

    const container = screen.getByRole('button', { name: /ver projetos/i })
      .parentElement!

    expect(container.style.opacity).toBe('1')
  })
})

import { renderHook, act } from '@testing-library/react'
import { useTypewriter } from './useTypewriter'

describe('useTypewriter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('não revela nada antes do delay inicial', () => {
    const { result } = renderHook(() => useTypewriter('Olá', 38, 600))

    act(() => {
      vi.advanceTimersByTime(599)
    })

    expect(result.current.displayed).toBe('')
    expect(result.current.done).toBe(false)
  })

  it('revela o texto completo e marca done ao terminar de digitar', () => {
    const text = 'Olá, mundo'
    const { result } = renderHook(() => useTypewriter(text, 38, 600))

    act(() => {
      vi.advanceTimersByTime(600 + text.length * 38)
    })

    expect(result.current.displayed).toBe(text)
    expect(result.current.done).toBe(true)
  })

  it('recomeça do zero quando o texto muda', () => {
    const { result, rerender } = renderHook(
      ({ text }) => useTypewriter(text, 38, 600),
      { initialProps: { text: 'Primeiro' } },
    )

    act(() => {
      vi.advanceTimersByTime(600 + 'Primeiro'.length * 38)
    })
    expect(result.current.done).toBe(true)

    rerender({ text: 'Segundo' })

    expect(result.current.displayed).toBe('')
    expect(result.current.done).toBe(false)

    act(() => {
      vi.advanceTimersByTime(600 + 'Segundo'.length * 38)
    })
    expect(result.current.displayed).toBe('Segundo')
    expect(result.current.done).toBe(true)
  })
})

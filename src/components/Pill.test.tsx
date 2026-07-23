import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Pill from './Pill'

describe('Pill', () => {
  it('renderiza o conteúdo como um botão', () => {
    render(<Pill>Ver projetos</Pill>)

    expect(
      screen.getByRole('button', { name: 'Ver projetos' }),
    ).toBeInTheDocument()
  })

  it('dispara o onClick ao ser clicado', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Pill onClick={onClick}>Sobre mim</Pill>)

    await user.click(screen.getByRole('button', { name: 'Sobre mim' }))

    expect(onClick).toHaveBeenCalledOnce()
  })

  it('usa type="button" por padrão para não submeter formulários', () => {
    render(<Pill>Contato</Pill>)

    expect(screen.getByRole('button', { name: 'Contato' })).toHaveAttribute(
      'type',
      'button',
    )
  })
})

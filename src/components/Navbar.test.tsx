import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Navbar from './Navbar'

describe('Navbar', () => {
  const getToggle = () =>
    screen.getByRole('button', { name: /toggle menu/i })

  it('o botão hambúrguer anuncia estar fechado por padrão', () => {
    render(<Navbar />)

    expect(getToggle()).toHaveAttribute('aria-expanded', 'false')
  })

  it('o botão anuncia estar aberto após o clique e fechado ao clicar de novo', async () => {
    const user = userEvent.setup()
    render(<Navbar />)

    await user.click(getToggle())
    expect(getToggle()).toHaveAttribute('aria-expanded', 'true')

    await user.click(getToggle())
    expect(getToggle()).toHaveAttribute('aria-expanded', 'false')
  })

  it('os links do overlay ficam invisíveis quando o menu está fechado', async () => {
    const user = userEvent.setup()
    render(<Navbar />)

    const overlay = document.getElementById('mobile-menu')!
    const overlayLink = overlay.querySelector('a[href="#projetos"]')!

    expect(overlayLink).not.toBeVisible()

    await user.click(getToggle())
    expect(overlayLink).toBeVisible()
  })
})

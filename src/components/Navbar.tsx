import { useState } from 'react'

const NAV_LINKS = [
  { label: 'Projetos', href: '#projetos' },
  { label: 'Sobre', href: '#sobre' },
  { label: 'Experiência', href: '#experiencia' },
  { label: 'Contato', href: '#contato' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <nav
        className="fixed top-0 left-0 w-full flex flex-row justify-between items-center px-5 sm:px-8 py-4 sm:py-5"
        style={{ zIndex: 10 }}
      >
        {/* Logo */}
        <div className="flex flex-row items-center gap-3">
          <span
            className="text-[21px] sm:text-[26px] tracking-tight text-black"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Pedro Ribeiro
          </span>
          <span
            className="text-[25px] sm:text-[30px] text-black select-none"
            style={{ letterSpacing: '-0.02em' }}
          >
            ✳︎
          </span>
        </div>

        {/* Desktop nav links */}
        <div className="hidden md:flex flex-row text-[23px] text-black">
          {NAV_LINKS.map((link, i) => (
            <span key={link.label}>
              <a
                href={link.href}
                className="hover:opacity-60 transition-opacity"
              >
                {link.label}
              </a>
              {i < NAV_LINKS.length - 1 && <span>, </span>}
            </span>
          ))}
        </div>

        {/* Desktop CTA */}
        <a
          href="#contato"
          className="hidden md:inline text-[23px] text-black underline underline-offset-2 hover:opacity-60 transition-opacity"
        >
          Vamos conversar
        </a>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((v) => !v)}
          className="md:hidden flex flex-col gap-[5px]"
        >
          <span
            className="w-6 h-[2px] bg-black transition-all duration-300"
            style={
              menuOpen
                ? { transform: 'translateY(7px) rotate(45deg)' }
                : undefined
            }
          />
          <span
            className="w-6 h-[2px] bg-black transition-all duration-300"
            style={{ opacity: menuOpen ? 0 : 1 }}
          />
          <span
            className="w-6 h-[2px] bg-black transition-all duration-300"
            style={
              menuOpen
                ? { transform: 'translateY(-7px) rotate(-45deg)' }
                : undefined
            }
          />
        </button>
      </nav>

      {/* Mobile overlay */}
      <div
        className="md:hidden fixed inset-0 bg-white/95 backdrop-blur-sm flex flex-col justify-center items-start px-8 gap-8 transition-opacity duration-300"
        style={{
          zIndex: 9,
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
        }}
      >
        {NAV_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="text-[32px] font-medium text-black"
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </a>
        ))}
        <a
          href="#contato"
          className="text-[32px] font-medium text-black underline underline-offset-2"
          onClick={() => setMenuOpen(false)}
        >
          Vamos conversar
        </a>
      </div>
    </>
  )
}

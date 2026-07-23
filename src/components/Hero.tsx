import { useEffect, useState } from 'react'
import { useTypewriter } from '../hooks/useTypewriter'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import Pill from './Pill'

const TYPEWRITER_TEXT =
  'Prazer, sou Pedro Ribeiro, Software Engineer. Transformo ideias em produtos web. Vamos construir algo?'

const PILL_LABELS = [
  'Ver projetos',
  'Sobre mim',
  'Minha experiência',
  'Vamos conversar',
]

const EMAIL = 'pedrohcribeiro75@gmail.com'

/** Two overlapping rectangles — a small copy icon. */
function CopyIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="3.5"
        y="3.5"
        width="7"
        height="7"
        rx="1"
        stroke="currentColor"
        strokeWidth="1"
      />
      <rect
        x="1.5"
        y="1.5"
        width="7"
        height="7"
        rx="1"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  )
}

export default function Hero() {
  const { displayed, done } = useTypewriter(TYPEWRITER_TEXT)
  const prefersReducedMotion = usePrefersReducedMotion()
  const [pillsVisible, setPillsVisible] = useState(prefersReducedMotion)
  const [copied, setCopied] = useState(false)

  // Pills fade/slide in 400ms after load, independent of the typewriter.
  // Com movimento reduzido, aparecem imediatamente (sem fade/slide).
  useEffect(() => {
    if (prefersReducedMotion) {
      setPillsVisible(true)
      return
    }
    const id = setTimeout(() => setPillsVisible(true), 400)
    return () => clearTimeout(id)
  }, [prefersReducedMotion])

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard indisponível (contexto inseguro ou permissão negada)
    }
  }

  return (
    <section
      className="h-screen flex flex-col justify-end pb-12 md:justify-center md:pb-0 px-5 sm:px-8 md:px-10 overflow-hidden"
      style={{ zIndex: 1, position: 'relative' }}
    >
      <div className="max-w-xl relative z-10">
        {/* 1. Blurred intro label */}
        <p
          className="pointer-events-none select-none mb-5 sm:mb-6"
          style={{
            fontSize: 'clamp(18px, 4vw, 26px)',
            lineHeight: 1.3,
            fontWeight: 400,
            color: '#000',
            filter: 'blur(4px)',
          }}
        >
          Software Engineer
          <br />
          React · Next.js · TypeScript
        </p>

        {/* 2. Typewriter text */}
        <p
          className="text-black mb-5 sm:mb-6"
          style={{
            fontSize: 'clamp(18px, 4vw, 26px)',
            lineHeight: 1.35,
            fontWeight: 400,
            minHeight: '54px',
          }}
        >
          {displayed}
          {!done && (
            <span
              className="inline-block w-[2px] h-[1.1em] bg-black align-middle ml-[2px]"
              style={{
                animation: prefersReducedMotion
                  ? undefined
                  : 'blink 1s step-end infinite',
              }}
            />
          )}
        </p>

        {/* 3. Action pill buttons */}
        <div
          className="flex flex-wrap gap-y-1"
          style={{
            opacity: pillsVisible ? 1 : 0,
            transform: prefersReducedMotion
              ? undefined
              : pillsVisible
                ? 'translateY(0)'
                : 'translateY(8px)',
            transition: prefersReducedMotion
              ? undefined
              : 'opacity 0.4s ease, transform 0.4s ease',
          }}
        >
          {PILL_LABELS.map((label) => (
            <Pill key={label}>{label}</Pill>
          ))}

          <Pill variant="outline" onClick={copyEmail} className="gap-2 sm:gap-3">
            <span>
              {copied ? (
                'Copiado!'
              ) : (
                <>
                  Fale comigo:{' '}
                  <span className="underline underline-offset-1">{EMAIL}</span>
                </>
              )}
            </span>
            <CopyIcon />
          </Pill>
        </div>
      </div>
    </section>
  )
}

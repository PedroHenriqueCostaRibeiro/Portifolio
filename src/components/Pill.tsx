import type { ComponentPropsWithoutRef } from 'react'

type PillVariant = 'solid' | 'outline'

interface PillProps extends ComponentPropsWithoutRef<'button'> {
  variant?: PillVariant
}

const BASE =
  'inline-flex items-center justify-center border rounded-full ' +
  'text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] ' +
  'whitespace-nowrap transition-colors duration-200'

const VARIANTS: Record<PillVariant, string> = {
  solid: 'bg-white text-black border-black/10 hover:bg-black hover:text-white',
  outline:
    'bg-transparent text-white border-white hover:bg-white hover:text-black',
}

export default function Pill({
  variant = 'solid',
  className,
  type = 'button',
  children,
  ...rest
}: PillProps) {
  return (
    <button
      type={type}
      className={`${BASE} ${VARIANTS[variant]} ${className ?? ''}`.trim()}
      {...rest}
    >
      {children}
    </button>
  )
}

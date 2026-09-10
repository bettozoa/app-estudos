import type { ReactNode } from 'react'
import { cores } from './tokens'

interface PilulaProps {
  icone?: ReactNode
  children: ReactNode
  cor?: string
}

// Selo pequeno para ofensiva/XP/moedas (seção 4 do PLANO_VISUAL.md).
export function Pilula({ icone, children, cor = cores.superficie }: PilulaProps) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold"
      style={{ backgroundColor: cor, border: `3px solid ${cores.contorno}`, color: cores.contorno }}
    >
      {icone}
      {children}
    </span>
  )
}

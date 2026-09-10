import { cores } from './tokens'

interface IconeProps {
  tamanho?: number
  cor?: string
}

// Pequeno conjunto de ícones no mesmo traço do mascote (contorno grosso, sem preenchimento
// fino) — substitui emoji de sistema nos elementos de UI que mais se repetem na tela
// (seção 4 do PLANO_VISUAL.md: "nunca misturar com biblioteca de ícones lineares finos").
const TRACO = 1.8

export function IconeFogo({ tamanho = 18, cor = cores.laranja }: IconeProps) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2c1 3-3 4-3 8a3 3 0 0 0 6 0c1 1 2 2.5 2 4.5A5 5 0 0 1 7 14c0-3 1.5-4.5 3-6-.5 1.5 0 2 1 1.5C11.5 8 11 5 12 2Z"
        fill={cor}
        stroke={cores.contorno}
        strokeWidth={TRACO}
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function IconeEstrela({ tamanho = 18, cor = cores.amarelo }: IconeProps) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2.5l2.7 5.7 6.1.7-4.5 4.3 1.2 6.1L12 16.4l-5.5 2.9 1.2-6.1L3.2 8.9l6.1-.7L12 2.5Z"
        fill={cor}
        stroke={cores.contorno}
        strokeWidth={TRACO}
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function IconeMoeda({ tamanho = 18, cor = cores.amarelo }: IconeProps) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" fill={cor} stroke={cores.contorno} strokeWidth={TRACO} />
      <text x="12" y="16" textAnchor="middle" fontSize="11" fontWeight="bold" fill={cores.contorno}>
        $
      </text>
    </svg>
  )
}

export function IconeEscudo({ tamanho = 18, cor = cores.azulCeu }: IconeProps) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2.5 4 5.5v5.6c0 5.1 3.4 8.7 8 10.4 4.6-1.7 8-5.3 8-10.4V5.5L12 2.5Z"
        fill={cor}
        stroke={cores.contorno}
        strokeWidth={TRACO}
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function IconeLivro({ tamanho = 20, cor = cores.azulCeu }: IconeProps) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 5.5c-1.6-1-4-1.3-6-.8v13.5c2-.5 4.4-.2 6 .8 1.6-1 4-1.3 6-.8V4.7c-2-.5-4.4-.2-6 .8Z"
        fill={cor}
        stroke={cores.contorno}
        strokeWidth={TRACO}
        strokeLinejoin="round"
      />
      <path d="M12 5.5v13.5" stroke={cores.contorno} strokeWidth={TRACO} />
    </svg>
  )
}

export function IconeCadeado({ tamanho = 20, cor = '#C9C2B4' }: IconeProps) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none">
      <rect x="5" y="11" width="14" height="10" rx="2" fill={cor} stroke={cores.contorno} strokeWidth={TRACO} />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke={cores.contorno} strokeWidth={TRACO} fill="none" />
      <circle cx="12" cy="16" r="1.6" fill={cores.contorno} />
    </svg>
  )
}

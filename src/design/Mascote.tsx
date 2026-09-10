import { cores } from './tokens'

export type EstadoMascote = 'acenando' | 'comemorando' | 'pensando' | 'encorajando' | 'dormindo'

interface MascoteProps {
  estado: EstadoMascote
  tamanho?: number
}

// Gato mascote: um único SVG com prop `estado`, mesmo viewBox em todas as poses
// (seção 1 do PLANO_VISUAL.md e seção 8: "troca de pose sem redesenhar layout").
// Ilustração deliberadamente simples nesta primeira versão — só geometria básica,
// para não travar a Fase 0 esperando arte final.
export function Mascote({ estado, tamanho = 120 }: MascoteProps) {
  const dormindo = estado === 'dormindo'

  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 160 160" role="img" aria-label={`Gato mascote — ${estado}`}>
      {!dormindo && (
        <rect x="55" y="120" width="50" height="30" rx="14" fill={cores.laranja} stroke={cores.contorno} strokeWidth={4} />
      )}

      <polygon points="48,55 60,20 72,55" fill={cores.fundo} stroke={cores.contorno} strokeWidth={4} strokeLinejoin="round" />
      <polygon points="88,55 100,20 112,55" fill={cores.fundo} stroke={cores.contorno} strokeWidth={4} strokeLinejoin="round" />
      <polygon points="53,52 60,30 67,52" fill={cores.rosa} />
      <polygon points="93,52 100,30 107,52" fill={cores.rosa} />

      <circle cx="80" cy="80" r="45" fill={cores.fundo} stroke={cores.contorno} strokeWidth={4} />

      <circle cx="55" cy="92" r="7" fill={cores.rosa} />
      <circle cx="105" cy="92" r="7" fill={cores.rosa} />

      {dormindo ? (
        <>
          <path d="M62 78 q8 8 16 0" stroke={cores.contorno} strokeWidth={4} fill="none" strokeLinecap="round" />
          <path d="M82 78 q8 8 16 0" stroke={cores.contorno} strokeWidth={4} fill="none" strokeLinecap="round" />
          <text x="108" y="42" fontSize="18" fontWeight="bold" fill={cores.contorno}>
            Zzz
          </text>
        </>
      ) : (
        <>
          <circle cx="66" cy="78" r="9" fill="#fff" stroke={cores.contorno} strokeWidth={3} />
          <circle cx="94" cy="78" r="9" fill="#fff" stroke={cores.contorno} strokeWidth={3} />
          <circle cx="68" cy="80" r="4" fill={cores.contorno} />
          <circle cx="96" cy="80" r="4" fill={cores.contorno} />
          <circle cx="70" cy="77" r="1.5" fill="#fff" />
          <circle cx="98" cy="77" r="1.5" fill="#fff" />
        </>
      )}

      <ellipse cx="80" cy="92" rx="3" ry="2.5" fill={cores.contorno} />

      <line x1="35" y1="90" x2="55" y2="88" stroke={cores.contorno} strokeWidth={2} strokeLinecap="round" />
      <line x1="35" y1="98" x2="55" y2="96" stroke={cores.contorno} strokeWidth={2} strokeLinecap="round" />
      <line x1="125" y1="90" x2="105" y2="88" stroke={cores.contorno} strokeWidth={2} strokeLinecap="round" />
      <line x1="125" y1="98" x2="105" y2="96" stroke={cores.contorno} strokeWidth={2} strokeLinecap="round" />

      <Boca estado={estado} />
      <Pata estado={estado} />
    </svg>
  )
}

function Boca({ estado }: { estado: EstadoMascote }) {
  const props = { stroke: cores.contorno, strokeWidth: 4, fill: 'none', strokeLinecap: 'round' as const }
  switch (estado) {
    case 'dormindo':
      return null
    case 'comemorando':
      return <path d="M68 98 q12 12 24 0" {...props} />
    case 'encorajando':
      return <path d="M70 100 q10 6 20 0" {...props} />
    case 'pensando':
      return <path d="M74 100 q6 2 12 0" {...props} />
    case 'acenando':
      return <path d="M70 99 q10 8 20 0" {...props} />
  }
}

function Pata({ estado }: { estado: EstadoMascote }) {
  const props = { fill: cores.fundo, stroke: cores.contorno, strokeWidth: 4 }
  switch (estado) {
    case 'dormindo':
      return null
    case 'comemorando':
      return (
        <>
          <circle cx="45" cy="118" r="10" {...props} />
          <circle cx="115" cy="118" r="10" {...props} />
        </>
      )
    case 'pensando':
      return <circle cx="95" cy="100" r="10" {...props} />
    case 'encorajando':
      return <ellipse cx="120" cy="115" rx="14" ry="10" {...props} />
    case 'acenando':
      return <circle cx="115" cy="105" r="10" {...props} />
  }
}

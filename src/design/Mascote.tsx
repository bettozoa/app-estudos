export type EstadoMascote = 'acenando' | 'comemorando' | 'pensando' | 'encorajando' | 'dormindo'

interface MascoteProps {
  estado: EstadoMascote
  tamanho?: number
}

// Gato mascote (seção 1 do PLANO_VISUAL.md). As artes ficam em public/mascote/{png,webp}/,
// um arquivo por estado — webp primeiro (bem mais leve), png como fallback via <picture>.
export function Mascote({ estado, tamanho = 120 }: MascoteProps) {
  return (
    <picture>
      <source srcSet={`/mascote/webp/${estado}.webp`} type="image/webp" />
      <img
        src={`/mascote/png/${estado}.png`}
        alt={`Gato mascote — ${estado}`}
        width={tamanho}
        height={tamanho}
        style={{ width: tamanho, height: tamanho, objectFit: 'contain' }}
      />
    </picture>
  )
}

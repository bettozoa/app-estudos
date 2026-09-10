import { obterSkin } from '../app/skins'

export type EstadoMascote = 'acenando' | 'comemorando' | 'pensando' | 'encorajando' | 'dormindo'

interface MascoteProps {
  estado: EstadoMascote
  tamanho?: number
  skinId?: string
}

// Gato mascote (seção 1 do PLANO_VISUAL.md). As artes ficam em public/mascote/{png,webp}/,
// um arquivo por estado — webp primeiro (bem mais leve), png como fallback via <picture>.
// Skins da Loja reaproveitam essas mesmas imagens, recoloridas via filtro CSS (sem precisar
// de arte nova por cor — ver app/skins.ts).
export function Mascote({ estado, tamanho = 120, skinId }: MascoteProps) {
  const filtroCss = obterSkin(skinId).filtroCss

  return (
    <picture>
      <source srcSet={`/mascote/webp/${estado}.webp`} type="image/webp" />
      <img
        src={`/mascote/png/${estado}.png`}
        alt={`Gato mascote — ${estado}`}
        width={tamanho}
        height={tamanho}
        style={{ width: tamanho, height: tamanho, objectFit: 'contain', filter: filtroCss || undefined }}
      />
    </picture>
  )
}

export interface Skin {
  id: string
  nome: string
  // Filtro CSS aplicado em cima da arte laranja original — reaproveita as mesmas imagens
  // (sem precisar de arte nova por skin) recolorindo via hue-rotate.
  filtroCss: string
  preco: number
}

export const SKIN_PADRAO = 'laranja'

export const SKINS: Skin[] = [
  { id: 'laranja', nome: 'Laranja (padrão)', filtroCss: '', preco: 0 },
  { id: 'azul', nome: 'Azul', filtroCss: 'hue-rotate(190deg) saturate(1.1)', preco: 20 },
  { id: 'verde', nome: 'Verde', filtroCss: 'hue-rotate(120deg) saturate(1.2)', preco: 20 },
  { id: 'roxo', nome: 'Roxo', filtroCss: 'hue-rotate(260deg) saturate(1.15)', preco: 30 },
  { id: 'rosa', nome: 'Rosa', filtroCss: 'hue-rotate(320deg) saturate(0.9)', preco: 30 },
]

export function obterSkin(id: string | undefined): Skin {
  return SKINS.find((s) => s.id === id) ?? SKINS[0]
}

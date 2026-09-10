// Paleta e raios do docs/PLANO_VISUAL.md (seções 2-3). Nenhum componente escreve hex direto:
// tudo referencia este arquivo.
export const cores = {
  contorno: '#1F2E3D',
  fundo: '#FFF8EC',
  superficie: '#FFFFFF',
  laranja: '#E2542B',
  amarelo: '#FFC53D',
  verde: '#2E9E5B',
  roxo: '#7F77DD',
  azulCeu: '#38A9C9',
  rosa: '#F5B8B0',
  erroFundo: '#FFE9E3',
} as const

// Sombra do "efeito de tecla" do botão principal — tom mais escuro da própria cor de fundo.
export const sombras = {
  laranja: '#B23F1F',
  branca: '#E4DBC8',
} as const

export const raios = {
  botao: 18,
  card: 16,
} as const

export const fontes = {
  base: "'Baloo 2', system-ui, sans-serif",
} as const

// Uma matéria = uma cor, fixa para sempre (seção 2 do PLANO_VISUAL.md).
export const materiaCores: Record<string, string> = {
  historia: cores.laranja,
  geografia: cores.verde,
  ciencias: cores.azulCeu,
  portugues: cores.roxo,
  matematica: cores.amarelo,
}

import type { Questao } from './tipos'

export interface OpcoesMontagem {
  tamanhoAlvo?: number
  proporcaoRevisao?: number
}

// Monta a fila de "Estudar hoje" (seção 6 do PLANO_APP_ESTUDOS.md):
// até 60% da sessão com revisões vencidas, o resto com questões novas do módulo atual.
// Se um dos dois lados não tiver o suficiente, completa com o que sobrar do outro.
export function montarSessao(
  revisoesVencidas: Questao[],
  questoesNovas: Questao[],
  opcoes: OpcoesMontagem = {},
): Questao[] {
  const tamanhoAlvo = opcoes.tamanhoAlvo ?? 20
  const proporcaoRevisao = opcoes.proporcaoRevisao ?? 0.6

  const maxRevisoes = Math.min(revisoesVencidas.length, Math.ceil(tamanhoAlvo * proporcaoRevisao))
  const revisoesSelecionadas = revisoesVencidas.slice(0, maxRevisoes)

  const vagasRestantes = Math.max(tamanhoAlvo - revisoesSelecionadas.length, 0)
  const novasSelecionadas = questoesNovas.slice(0, vagasRestantes)

  const sessao = [...revisoesSelecionadas, ...novasSelecionadas]

  const vagasAindaLivres = tamanhoAlvo - sessao.length
  if (vagasAindaLivres > 0 && revisoesVencidas.length > revisoesSelecionadas.length) {
    const extra = revisoesVencidas.slice(maxRevisoes, maxRevisoes + vagasAindaLivres)
    return [...sessao, ...extra]
  }

  return sessao
}

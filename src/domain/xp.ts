import type { SituacaoResposta } from './tipos'

const PONTOS: Record<SituacaoResposta, number> = {
  primeiraVez: 10,
  revisao: 6,
  aposErro: 3,
  erro: 0,
}

// Seção 7 do PLANO_APP_ESTUDOS.md: erro não tira ponto — perder pontos desestimula tentar.
export function calcularXP(situacao: SituacaoResposta): number {
  return PONTOS[situacao]
}

// Moedas: 1 a cada 20 XP. Usa o XP total acumulado (antes/depois), não o ganho isolado da
// resposta, pra não perder moeda por arredondamento quando o ganho de uma resposta é < 20.
export function calcularMoedasGanhas(xpAntes: number, xpDepois: number): number {
  return Math.floor(xpDepois / 20) - Math.floor(xpAntes / 20)
}

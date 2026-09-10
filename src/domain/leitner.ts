const INTERVALOS_DIAS: Record<number, number> = { 1: 0, 2: 1, 3: 3, 4: 7, 5: 16 }
const CAIXA_MINIMA = 1
const CAIXA_MAXIMA = 5

export interface ResultadoAgendamento {
  caixa: number
  proximaRevisao: Date
}

// Leitner de 5 caixas (seção 6 do PLANO_APP_ESTUDOS.md).
// Acertou: sobe uma caixa. Errou: volta para a caixa 1 e a próxima revisão é hoje
// (a reinserção dentro da mesma sessão é responsabilidade da tela de Sessão, não desta função).
export function agendarProxima(caixaAtual: number, acertou: boolean, hoje: Date = new Date()): ResultadoAgendamento {
  const caixaValida = Math.min(Math.max(caixaAtual, CAIXA_MINIMA), CAIXA_MAXIMA)
  const novaCaixa = acertou ? Math.min(caixaValida + 1, CAIXA_MAXIMA) : CAIXA_MINIMA
  const dias = INTERVALOS_DIAS[novaCaixa]
  return { caixa: novaCaixa, proximaRevisao: somarDias(hoje, dias) }
}

function somarDias(data: Date, dias: number): Date {
  const resultado = new Date(data)
  resultado.setDate(resultado.getDate() + dias)
  return resultado
}

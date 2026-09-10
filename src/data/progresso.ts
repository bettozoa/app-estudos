import { formatarDataISO } from '../app/utilAleatorio'
import { agendarProxima } from '../domain/leitner'
import type { ProgressoQuestao } from '../domain/tipos'
import { db } from './db'

export async function obterProgresso(questaoId: string): Promise<ProgressoQuestao | undefined> {
  return db.progresso.get(questaoId)
}

export async function registrarResposta(
  questaoId: string,
  acertou: boolean,
  agora: Date = new Date(),
): Promise<ProgressoQuestao> {
  const atual = await db.progresso.get(questaoId)
  const caixaAtual = atual?.caixa ?? 1
  const { caixa, proximaRevisao } = agendarProxima(caixaAtual, acertou, agora)

  const registro: ProgressoQuestao = {
    questaoId,
    caixa,
    acertos: (atual?.acertos ?? 0) + (acertou ? 1 : 0),
    erros: (atual?.erros ?? 0) + (acertou ? 0 : 1),
    proximaRevisao: formatarDataISO(proximaRevisao),
    ultimaResposta: agora.toISOString(),
  }
  await db.progresso.put(registro)
  return registro
}

export async function listarRevisoesVencidas(hoje: Date = new Date()): Promise<ProgressoQuestao[]> {
  const hojeISO = formatarDataISO(hoje)
  return db.progresso.where('proximaRevisao').belowOrEqual(hojeISO).toArray()
}

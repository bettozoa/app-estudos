import { formatarDataISO } from '../app/utilAleatorio'
import { agendarProxima } from '../domain/leitner'
import type { ProgressoQuestao } from '../domain/tipos'
import { db, type LinhaProgressoLocal } from './db'

export async function obterProgresso(alunoId: string, questaoId: string): Promise<LinhaProgressoLocal | undefined> {
  return db.progresso.get([alunoId, questaoId])
}

export async function listarProgressoDoAluno(alunoId: string): Promise<LinhaProgressoLocal[]> {
  return db.progresso.where('alunoId').equals(alunoId).toArray()
}

// Grava a resposta local (progresso + fila de sync) — a Fase 1 ainda não faz o push aqui,
// isso é papel do worker em data/sync.ts, que lê `filaSync` e sobe pra Supabase quando há rede.
export async function registrarResposta(
  alunoId: string,
  questaoId: string,
  acertou: boolean,
  agora: Date = new Date(),
): Promise<LinhaProgressoLocal> {
  const atual = await db.progresso.get([alunoId, questaoId])
  const caixaAtual = atual?.caixa ?? 1
  const { caixa, proximaRevisao } = agendarProxima(caixaAtual, acertou, agora)

  const progresso: ProgressoQuestao = {
    questaoId,
    caixa,
    acertos: (atual?.acertos ?? 0) + (acertou ? 1 : 0),
    erros: (atual?.erros ?? 0) + (acertou ? 0 : 1),
    proximaRevisao: formatarDataISO(proximaRevisao),
    ultimaResposta: agora.toISOString(),
  }
  const linha: LinhaProgressoLocal = { ...progresso, alunoId, sincronizado: false }

  await db.transaction('rw', db.progresso, db.filaSync, async () => {
    await db.progresso.put(linha)
    await db.filaSync.add({
      alunoId,
      questaoId,
      acertou,
      ms: null,
      progresso,
      criadoEmLocal: agora.toISOString(),
    })
  })

  return linha
}

export async function listarRevisoesVencidas(alunoId: string, hoje: Date = new Date()): Promise<LinhaProgressoLocal[]> {
  const hojeISO = formatarDataISO(hoje)
  const doAluno = await db.progresso.where('alunoId').equals(alunoId).toArray()
  return doAluno.filter((p) => p.proximaRevisao <= hojeISO)
}

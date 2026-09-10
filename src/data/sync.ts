import { mesclarProgresso } from '../domain/mesclarProgresso'
import type { ProgressoQuestao } from '../domain/tipos'
import { db } from './db'
import { supabase } from './supabaseClient'

const chaveUltimaSincronizacao = (alunoId: string) => `app-estudos:ultima-sync:${alunoId}`

// Push: esvazia a fila local de respostas pendentes pro Supabase. Item que falhar (sem rede,
// erro passageiro) fica na fila pra tentar de novo no próximo gatilho — sem fila sofisticada
// de retry/backoff, só tenta de novo na próxima chamada.
export async function processarFilaSync(alunoId: string): Promise<{ enviados: number; falharam: number }> {
  const itens = await db.filaSync.where('alunoId').equals(alunoId).toArray()
  let enviados = 0
  let falharam = 0

  for (const item of itens) {
    try {
      const { error: erroResposta } = await supabase.from('respostas').insert({
        aluno_id: item.alunoId,
        questao_id: item.questaoId,
        acertou: item.acertou,
        ms: item.ms,
      })
      if (erroResposta) throw erroResposta

      const { error: erroProgresso } = await supabase.from('progresso').upsert(
        {
          aluno_id: item.alunoId,
          questao_id: item.progresso.questaoId,
          caixa: item.progresso.caixa,
          acertos: item.progresso.acertos,
          erros: item.progresso.erros,
          proxima_revisao: item.progresso.proximaRevisao,
          ultima_resposta: item.progresso.ultimaResposta,
        },
        { onConflict: 'aluno_id,questao_id' },
      )
      if (erroProgresso) throw erroProgresso

      await db.progresso.update([item.alunoId, item.questaoId], { sincronizado: true })
      if (item.id !== undefined) await db.filaSync.delete(item.id)
      enviados++
    } catch (erro) {
      falharam++
      console.error('[sync] falhou ao enviar resposta, fica na fila pra tentar de novo:', erro)
    }
  }

  return { enviados, falharam }
}

// Pull: busca no servidor só o que mudou desde a última sincronização deste aluno neste
// aparelho, e mescla com o que já existe localmente pela regra de conflito do domínio.
export async function puxarProgresso(alunoId: string): Promise<number> {
  const desde = localStorage.getItem(chaveUltimaSincronizacao(alunoId)) ?? '1970-01-01T00:00:00.000Z'

  const { data, error } = await supabase
    .from('progresso')
    .select('questao_id, caixa, acertos, erros, proxima_revisao, ultima_resposta, atualizado_em')
    .eq('aluno_id', alunoId)
    .gt('atualizado_em', desde)

  if (error) throw error
  if (!data || data.length === 0) return 0

  let maisRecente = desde
  for (const linha of data) {
    const remoto: ProgressoQuestao = {
      questaoId: linha.questao_id,
      caixa: linha.caixa,
      acertos: linha.acertos,
      erros: linha.erros,
      proximaRevisao: linha.proxima_revisao,
      ultimaResposta: linha.ultima_resposta ?? new Date(0).toISOString(),
    }
    const local = await db.progresso.get([alunoId, remoto.questaoId])
    const mesclado = local ? mesclarProgresso(local, remoto) : remoto
    await db.progresso.put({ ...mesclado, alunoId, sincronizado: true })

    if (linha.atualizado_em > maisRecente) maisRecente = linha.atualizado_em
  }

  localStorage.setItem(chaveUltimaSincronizacao(alunoId), maisRecente)
  return data.length
}

// Stats/conquistas (Fase 2) são um retrato atual, não um log — por isso não passam pela
// filaSync: cada chamada simplesmente reenvia o que há de mais recente localmente.
export async function sincronizarStats(alunoId: string): Promise<void> {
  const stats = await db.alunoStats.get(alunoId)
  if (!stats || stats.sincronizado) return

  const { error } = await supabase.from('aluno_stats').upsert(
    {
      aluno_id: alunoId,
      xp: stats.xp,
      nivel: stats.nivel,
      moedas: stats.moedas,
      ofensiva: stats.ofensiva,
      melhor_ofensiva: stats.melhorOfensiva,
      escudos: stats.escudos,
      ultimo_dia_ativo: stats.ultimoDiaAtivo,
      revisoes_em_dia_total: stats.revisoesEmDiaTotal,
    },
    { onConflict: 'aluno_id' },
  )
  if (error) {
    console.error('[sync] falhou ao enviar stats, tenta de novo no próximo gatilho:', error)
    return
  }
  await db.alunoStats.update(alunoId, { sincronizado: true })
}

export async function sincronizarConquistas(alunoId: string): Promise<void> {
  const pendentes = await db.alunoConquistas.where({ alunoId, sincronizado: false }).toArray()
  for (const conquista of pendentes) {
    const { error } = await supabase
      .from('aluno_conquistas')
      .upsert(
        { aluno_id: alunoId, conquista_codigo: conquista.codigo, obtida_em: conquista.obtidaEm },
        { onConflict: 'aluno_id,conquista_codigo', ignoreDuplicates: true },
      )
    if (error) {
      console.error('[sync] falhou ao enviar conquista, tenta de novo no próximo gatilho:', error)
      continue
    }
    await db.alunoConquistas.update([alunoId, conquista.codigo], { sincronizado: true })
  }
}

export async function sincronizar(alunoId: string): Promise<void> {
  await processarFilaSync(alunoId)
  await puxarProgresso(alunoId)
  await sincronizarStats(alunoId)
  await sincronizarConquistas(alunoId)
}

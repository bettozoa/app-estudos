import { calcularMoedasGanhas, calcularXP } from '../domain/xp'
import { atualizarOfensiva } from '../domain/ofensiva'
import type { EstatisticasAluno, SituacaoResposta } from '../domain/tipos'
import { formatarDataISO } from '../app/utilAleatorio'
import { db, type LinhaStatsLocal } from './db'

const STATS_ZERADAS: EstatisticasAluno = {
  xp: 0,
  nivel: 1,
  moedas: 0,
  ofensiva: 0,
  melhorOfensiva: 0,
  escudos: 0,
  ultimoDiaAtivo: null,
  revisoesEmDiaTotal: 0,
}

export async function obterStats(alunoId: string): Promise<LinhaStatsLocal> {
  const atual = await db.alunoStats.get(alunoId)
  return atual ?? { ...STATS_ZERADAS, alunoId, sincronizado: false }
}

export interface ResultadoRegistroXP {
  xpGanho: number
  moedasGanhas: number
  stats: LinhaStatsLocal
}

// Atualiza XP/moedas/contador de revisões em dia a partir de uma resposta — chamado a cada
// pergunta respondida (ver estado/sessaoStore.ts).
export async function registrarXpEMoedas(alunoId: string, situacao: SituacaoResposta): Promise<ResultadoRegistroXP> {
  const atual = await obterStats(alunoId)
  const xpGanho = calcularXP(situacao)
  const xpDepois = atual.xp + xpGanho
  const moedasGanhas = calcularMoedasGanhas(atual.xp, xpDepois)

  const stats: LinhaStatsLocal = {
    ...atual,
    xp: xpDepois,
    moedas: atual.moedas + moedasGanhas,
    revisoesEmDiaTotal: atual.revisoesEmDiaTotal + (situacao === 'revisao' ? 1 : 0),
    sincronizado: false,
  }

  await db.alunoStats.put(stats)
  return { xpGanho, moedasGanhas, stats }
}

// Conta o dia de hoje pra ofensiva — chamado uma vez ao final de cada sessão concluída
// (uma sessão de 15-20 questões já cobre de sobra a meta diária de "1 sessão ou 10 questões").
export async function registrarOfensivaDoDia(alunoId: string, hoje: Date = new Date()): Promise<LinhaStatsLocal> {
  const atual = await obterStats(alunoId)
  const resultado = atualizarOfensiva(atual, formatarDataISO(hoje))
  const stats: LinhaStatsLocal = { ...atual, ...resultado, sincronizado: false }
  await db.alunoStats.put(stats)
  return stats
}

export async function listarConquistasObtidas(alunoId: string): Promise<string[]> {
  const linhas = await db.alunoConquistas.where('alunoId').equals(alunoId).toArray()
  return linhas.map((l) => l.codigo)
}

export async function registrarConquistasNovas(alunoId: string, codigos: string[], agora: Date = new Date()): Promise<void> {
  if (codigos.length === 0) return
  await db.alunoConquistas.bulkPut(
    codigos.map((codigo) => ({ alunoId, codigo, obtidaEm: agora.toISOString(), sincronizado: false })),
  )
}

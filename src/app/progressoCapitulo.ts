import { db } from '../data/db'
import type { Questao } from '../domain/tipos'
import type { CapituloComQuestoes } from './indexarConteudo'

const CAIXA_DOMINADA = 5

// "Retrato" das caixas do aluno pras questões de um capítulo, num instante — usado pra
// comparar antes/depois de uma sessão e detectar módulo/capítulo recém-dominado.
export async function tirarSnapshotCapitulo(alunoId: string, capitulo: CapituloComQuestoes): Promise<Map<string, number>> {
  const idsDoCapitulo = new Set(capitulo.questoes.map((q) => q.id))
  const linhas = await db.progresso.where('alunoId').equals(alunoId).toArray()
  const mapa = new Map<string, number>()
  for (const linha of linhas) {
    if (idsDoCapitulo.has(linha.questaoId)) mapa.set(linha.questaoId, linha.caixa)
  }
  return mapa
}

export function moduloDominado(questoesDoModulo: Questao[], caixaPorId: Map<string, number>): boolean {
  return questoesDoModulo.length > 0 && questoesDoModulo.every((q) => (caixaPorId.get(q.id) ?? 0) >= CAIXA_DOMINADA)
}

export function capituloDominado(capitulo: CapituloComQuestoes, caixaPorId: Map<string, number>): boolean {
  return capitulo.questoes.length > 0 && capitulo.questoes.every((q) => (caixaPorId.get(q.id) ?? 0) >= CAIXA_DOMINADA)
}

export function algumModuloRecemDominado(capitulo: CapituloComQuestoes, antes: Map<string, number>, depois: Map<string, number>): boolean {
  return capitulo.modulos.some((modulo) => {
    const questoesDoModulo = capitulo.questoes.filter((q) => q.moduloId === modulo.id)
    return moduloDominado(questoesDoModulo, depois) && !moduloDominado(questoesDoModulo, antes)
  })
}

import type { ProgressoQuestao, Questao } from '../domain/tipos'
import type { CapituloComQuestoes, MateriaIndexada } from './indexarConteudo'

const CAIXA_DOMINADA = 5

export interface ResumoMateria {
  materia: MateriaIndexada
  capituloAtual: CapituloComQuestoes | null
  progressoCapituloAtual: number // 0..1
  revisoesVencidas: Questao[]
  questoesNovas: Questao[]
}

// Capítulo atual = primeiro capítulo (na ordem) que ainda não está 100% dominado.
// Fase 0 não tem tela de "capítulo desbloqueado": ao dominar um capítulo, o próximo
// já aparece automaticamente como atual, com 0% de progresso.
export function calcularResumoMateria(
  materia: MateriaIndexada,
  progressoPorId: Map<string, ProgressoQuestao>,
  hojeISO: string,
): ResumoMateria {
  const capituloAtual =
    materia.capitulos.find((cap) => cap.questoes.some((q) => (progressoPorId.get(q.id)?.caixa ?? 0) < CAIXA_DOMINADA)) ??
    materia.capitulos[materia.capitulos.length - 1] ??
    null

  const todasQuestoesDaMateria = materia.capitulos.flatMap((c) => c.questoes)
  const revisoesVencidas = todasQuestoesDaMateria.filter((q) => {
    const progresso = progressoPorId.get(q.id)
    return progresso !== undefined && progresso.proximaRevisao <= hojeISO
  })

  const questoesNovas = capituloAtual ? capituloAtual.questoes.filter((q) => !progressoPorId.has(q.id)) : []

  const dominadasNoCapAtual = capituloAtual
    ? capituloAtual.questoes.filter((q) => (progressoPorId.get(q.id)?.caixa ?? 0) >= CAIXA_DOMINADA).length
    : 0
  const progressoCapituloAtual = capituloAtual && capituloAtual.questoes.length > 0 ? dominadasNoCapAtual / capituloAtual.questoes.length : 0

  return { materia, capituloAtual, progressoCapituloAtual, revisoesVencidas, questoesNovas }
}

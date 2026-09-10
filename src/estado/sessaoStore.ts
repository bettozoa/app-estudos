import { create } from 'zustand'
import { obterProgresso, registrarResposta } from '../data/progresso'
import { registrarXpEMoedas } from '../data/stats'
import { processarFilaSync, sincronizarStats } from '../data/sync'
import type { Questao, SituacaoResposta } from '../domain/tipos'

interface SessaoState {
  fila: Questao[]
  posicao: number
  acertos: number
  erros: number
  xpGanho: number
  moedasGanhas: number
  sequenciaAtual: number
  maiorSequencia: number
  feedback: { acertou: boolean } | null
  reinseridas: Set<string>
  alunoId: string | null
  materiaId: string | null
  capituloId: string | null
  ofensivaAtual: number
  melhorOfensiva: number
  conquistasNovas: string[]
}

interface SessaoActions {
  iniciar: (params: { fila: Questao[]; alunoId: string; materiaId: string; capituloId: string }) => void
  responder: (acertou: boolean) => Promise<void>
  avancar: () => void
  finalizar: (dados: { ofensivaAtual: number; melhorOfensiva: number; conquistasNovas: string[] }) => void
}

const ESTADO_INICIAL: SessaoState = {
  fila: [],
  posicao: 0,
  acertos: 0,
  erros: 0,
  xpGanho: 0,
  moedasGanhas: 0,
  sequenciaAtual: 0,
  maiorSequencia: 0,
  feedback: null,
  reinseridas: new Set(),
  alunoId: null,
  materiaId: null,
  capituloId: null,
  ofensivaAtual: 0,
  melhorOfensiva: 0,
  conquistasNovas: [],
}

// Estado da sessão de estudo em andamento (seção 3 do PLANO_APP_ESTUDOS.md: Zustand).
// Ao errar, a questão volta 3 posições à frente na mesma sessão (comportamento do protótipo em
// legado/), só uma vez por questão — se errar de novo, ela volta amanhã via agendarProxima.
export const useSessaoStore = create<SessaoState & SessaoActions>((set, get) => ({
  ...ESTADO_INICIAL,

  iniciar: ({ fila, alunoId, materiaId, capituloId }) =>
    set({ ...ESTADO_INICIAL, fila, alunoId, materiaId, capituloId, reinseridas: new Set() }),

  responder: async (acertou) => {
    const { fila, posicao, reinseridas, alunoId } = get()
    const questao = fila[posicao]
    if (!questao || !alunoId) return

    const jaExistia = (await obterProgresso(alunoId, questao.id)) !== undefined
    await registrarResposta(alunoId, questao.id, acertou)

    const situacao: SituacaoResposta = !acertou
      ? 'erro'
      : reinseridas.has(questao.id)
        ? 'aposErro'
        : jaExistia
          ? 'revisao'
          : 'primeiraVez'
    const { xpGanho, moedasGanhas } = await registrarXpEMoedas(alunoId, situacao)

    let novaFila = fila
    const novasReinseridas = new Set(reinseridas)
    if (!acertou && !reinseridas.has(questao.id)) {
      const destino = Math.min(posicao + 3, fila.length)
      novaFila = [...fila.slice(0, destino), questao, ...fila.slice(destino)]
      novasReinseridas.add(questao.id)
    }

    set((estado) => {
      const novaSequencia = acertou ? estado.sequenciaAtual + 1 : 0
      return {
        fila: novaFila,
        reinseridas: novasReinseridas,
        acertos: estado.acertos + (acertou ? 1 : 0),
        erros: estado.erros + (acertou ? 0 : 1),
        xpGanho: estado.xpGanho + xpGanho,
        moedasGanhas: estado.moedasGanhas + moedasGanhas,
        sequenciaAtual: novaSequencia,
        maiorSequencia: Math.max(estado.maiorSequencia, novaSequencia),
        feedback: { acertou },
      }
    })

    // Tenta subir a fila na hora, sem travar a UI — se não houver rede, fica pendente e
    // o worker periódico (ver useSincronizacao) tenta de novo depois.
    void processarFilaSync(alunoId)
    void sincronizarStats(alunoId)
  },

  avancar: () => set((estado) => ({ posicao: estado.posicao + 1, feedback: null })),

  finalizar: (dados) => set(dados),
}))

import { create } from 'zustand'
import { registrarResposta } from '../data/progresso'
import type { Questao } from '../domain/tipos'

interface SessaoState {
  fila: Questao[]
  posicao: number
  acertos: number
  erros: number
  feedback: { acertou: boolean } | null
  reinseridas: Set<string>
  materiaId: string | null
  capituloId: string | null
}

interface SessaoActions {
  iniciar: (params: { fila: Questao[]; materiaId: string; capituloId: string }) => void
  responder: (acertou: boolean) => Promise<void>
  avancar: () => void
}

const ESTADO_INICIAL: SessaoState = {
  fila: [],
  posicao: 0,
  acertos: 0,
  erros: 0,
  feedback: null,
  reinseridas: new Set(),
  materiaId: null,
  capituloId: null,
}

// Estado da sessão de estudo em andamento (seção 3 do PLANO_APP_ESTUDOS.md: Zustand).
// Ao errar, a questão volta 3 posições à frente na mesma sessão (comportamento do protótipo em
// legado/), só uma vez por questão — se errar de novo, ela volta amanhã via agendarProxima.
export const useSessaoStore = create<SessaoState & SessaoActions>((set, get) => ({
  ...ESTADO_INICIAL,

  iniciar: ({ fila, materiaId, capituloId }) => set({ ...ESTADO_INICIAL, fila, materiaId, capituloId, reinseridas: new Set() }),

  responder: async (acertou) => {
    const { fila, posicao, reinseridas } = get()
    const questao = fila[posicao]
    if (!questao) return

    await registrarResposta(questao.id, acertou)

    let novaFila = fila
    const novasReinseridas = new Set(reinseridas)
    if (!acertou && !reinseridas.has(questao.id)) {
      const destino = Math.min(posicao + 3, fila.length)
      novaFila = [...fila.slice(0, destino), questao, ...fila.slice(destino)]
      novasReinseridas.add(questao.id)
    }

    set((estado) => ({
      fila: novaFila,
      reinseridas: novasReinseridas,
      acertos: estado.acertos + (acertou ? 1 : 0),
      erros: estado.erros + (acertou ? 0 : 1),
      feedback: { acertou },
    }))
  },

  avancar: () => set((estado) => ({ posicao: estado.posicao + 1, feedback: null })),
}))

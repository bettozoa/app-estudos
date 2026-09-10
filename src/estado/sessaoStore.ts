import { create } from 'zustand'
import { obterProgresso, registrarResposta } from '../data/progresso'
import { registrarXpEMoedas } from '../data/stats'
import { processarFilaSync, sincronizarStats } from '../data/sync'
import type { Questao, SituacaoResposta } from '../domain/tipos'

// Teto de crescimento da fila (achado da auditoria: sem isso, uma sessão de 15-20 perguntas
// podia efetivamente dobrar de tamanho num dia ruim). Depois desse limite, errar ainda marca
// a questão pra voltar amanhã (agendarProxima já cuida disso) — só não reinsere na sessão de hoje.
const FATOR_MAXIMO_FILA = 1.4

interface SessaoState {
  fila: Questao[]
  posicao: number
  tamanhoOriginal: number
  acertos: number
  erros: number
  xpGanho: number
  moedasGanhas: number
  sequenciaAtual: number
  maiorSequencia: number
  feedback: { acertou: boolean } | null
  reinseridas: Set<string>
  erradas: Questao[]
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
  tamanhoOriginal: 0,
  acertos: 0,
  erros: 0,
  xpGanho: 0,
  moedasGanhas: 0,
  sequenciaAtual: 0,
  maiorSequencia: 0,
  feedback: null,
  reinseridas: new Set(),
  erradas: [],
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
    set({ ...ESTADO_INICIAL, fila, tamanhoOriginal: fila.length, alunoId, materiaId, capituloId, reinseridas: new Set() }),

  responder: async (acertou) => {
    const { fila, posicao, tamanhoOriginal, reinseridas, erradas, alunoId } = get()
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
    const tetoFila = Math.ceil(tamanhoOriginal * FATOR_MAXIMO_FILA)
    if (!acertou && !reinseridas.has(questao.id) && fila.length < tetoFila) {
      const destino = Math.min(posicao + 3, fila.length)
      novaFila = [...fila.slice(0, destino), questao, ...fila.slice(destino)]
      novasReinseridas.add(questao.id)
    }

    set((estado) => {
      const novaSequencia = acertou ? estado.sequenciaAtual + 1 : 0
      return {
        fila: novaFila,
        reinseridas: novasReinseridas,
        // "O que escapou" no fim de sessão: só o que continua errado no fim, não o que foi
        // errado e depois corrigido na reinserção.
        erradas: acertou ? erradas.filter((q) => q.id !== questao.id) : [...erradas.filter((q) => q.id !== questao.id), questao],
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

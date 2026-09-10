import Dexie, { type Table } from 'dexie'
import type { ProgressoQuestao } from '../domain/tipos'

export interface LinhaProgressoLocal extends ProgressoQuestao {
  alunoId: string
  sincronizado: boolean
}

export interface ItemFilaSync {
  id?: number
  alunoId: string
  questaoId: string
  acertou: boolean
  ms: number | null
  progresso: ProgressoQuestao
  criadoEmLocal: string
}

// Progresso local, agora com um perfil (aluno) por linha (Fase 1: contas/multi-perfil).
// O conteúdo em si não precisa de tabela própria aqui: é lido de conteudo/ em tempo de build
// (ver carregarConteudo.ts) e já fica embutido no bundle, então funciona offline sem cache extra.
//
// `filaSync` é a fila de push: cada resposta grava aqui além de em `progresso`, e um worker
// (ver data/sync.ts) esvazia pra Supabase quando há rede, na ordem em que foram respondidas.
export class AppEstudosDB extends Dexie {
  progresso!: Table<LinhaProgressoLocal, [string, string]>
  filaSync!: Table<ItemFilaSync, number>

  constructor() {
    super('app-estudos')
    // v1 (Fase 0, sem conta) fica pra trás de propósito: era só progresso de teste local.
    this.version(2).stores({
      progresso: '[alunoId+questaoId], alunoId, proximaRevisao',
      filaSync: '++id, alunoId',
    })
  }
}

export const db = new AppEstudosDB()

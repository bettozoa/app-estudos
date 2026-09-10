import Dexie, { type Table } from 'dexie'
import type { ProgressoQuestao } from '../domain/tipos'

// Progresso local (Fase 0: sem conta, um único perfil no aparelho).
// O conteúdo em si não precisa de tabela própria aqui: é lido de conteudo/ em tempo de build
// (ver carregarConteudo.ts) e já fica embutido no bundle, então funciona offline sem cache extra.
export class AppEstudosDB extends Dexie {
  progresso!: Table<ProgressoQuestao, string>

  constructor() {
    super('app-estudos')
    this.version(1).stores({
      progresso: 'questaoId, proximaRevisao',
    })
  }
}

export const db = new AppEstudosDB()

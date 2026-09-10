import Dexie, { type Table } from 'dexie'
import type { EstatisticasAluno, ProgressoQuestao, Questao } from '../domain/tipos'

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

export interface LinhaStatsLocal extends EstatisticasAluno {
  alunoId: string
  sincronizado: boolean
}

export interface LinhaConquistaLocal {
  alunoId: string
  codigo: string
  obtidaEm: string
  sincronizado: boolean
}

export interface LinhaMateriaLocal {
  id: string
  nome: string
  emoji: string
  cor: string
  ordem: number
}

export interface LinhaCapituloLocal {
  id: string
  materiaId: string
  titulo: string
  livro: string | null
  paginas: string | null
  ordem: number
  publicado: boolean
}

export interface LinhaModuloLocal {
  id: string
  capituloId: string
  titulo: string
  ordem: number
}

export type LinhaQuestaoLocal = Questao

export interface LinhaMetaConteudo {
  chave: string
  valor: string
}

// Progresso local, com um perfil (aluno) por linha (Fase 1: contas/multi-perfil).
//
// `filaSync` é a fila de push: cada resposta grava aqui além de em `progresso`, e um worker
// (ver data/sync.ts) esvazia pra Supabase quando há rede, na ordem em que foram respondidas.
//
// `alunoStats`/`alunoConquistas` (Fase 2) guardam um retrato atual (não uma fila de eventos):
// basta reenviar o valor mais recente pro Supabase, por isso não passam pela `filaSync`.
//
// `conteudo*`/`conteudoMeta` (Fase 3): cache local do conteúdo que vive no Supabase — antes
// (Fases 0-2) o conteúdo vinha embutido no bundle; agora é baixado e comparado por versão
// (ver data/sincronizarConteudo.ts), o que permite publicar capítulo novo sem novo deploy.
export class AppEstudosDB extends Dexie {
  progresso!: Table<LinhaProgressoLocal, [string, string]>
  filaSync!: Table<ItemFilaSync, number>
  alunoStats!: Table<LinhaStatsLocal, string>
  alunoConquistas!: Table<LinhaConquistaLocal, [string, string]>
  conteudoMaterias!: Table<LinhaMateriaLocal, string>
  conteudoCapitulos!: Table<LinhaCapituloLocal, string>
  conteudoModulos!: Table<LinhaModuloLocal, string>
  conteudoQuestoes!: Table<LinhaQuestaoLocal, string>
  conteudoMeta!: Table<LinhaMetaConteudo, string>

  constructor() {
    super('app-estudos')
    // v1 (Fase 0, sem conta) fica pra trás de propósito: era só progresso de teste local.
    this.version(2).stores({
      progresso: '[alunoId+questaoId], alunoId, proximaRevisao',
      filaSync: '++id, alunoId',
    })
    this.version(3).stores({
      alunoStats: 'alunoId',
      alunoConquistas: '[alunoId+codigo], alunoId',
    })
    this.version(4).stores({
      conteudoMaterias: 'id',
      conteudoCapitulos: 'id, materiaId',
      conteudoModulos: 'id, capituloId',
      conteudoQuestoes: 'id, moduloId',
      conteudoMeta: 'chave',
    })
  }
}

export const db = new AppEstudosDB()

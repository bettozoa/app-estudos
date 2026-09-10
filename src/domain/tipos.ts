export type TipoQuestao = 'mc' | 'vf' | 'assoc'

export interface Questao {
  id: string
  moduloId: string
  tipo: TipoQuestao
  enunciado: string
  apoio: string | null
  alternativas: string[] | null
  correta: number | null
  pares: [string, string][] | null
  explicacao: string
  fonte: string
  dificuldade: number
  ativo: boolean
}

export interface ProgressoQuestao {
  questaoId: string
  caixa: number
  acertos: number
  erros: number
  proximaRevisao: string
  ultimaResposta: string
}

export interface Prova {
  id: string
  materiaId: string
  materiaNome: string
  titulo: string
  data: string
  capitulos: string[]
}

export interface CapituloProgresso {
  capituloId: string
  progresso: number
  proximoCapituloId: string | null
}

// ---------- gamificação (seção 7 do PLANO_APP_ESTUDOS.md) ----------

export type SituacaoResposta = 'primeiraVez' | 'revisao' | 'aposErro' | 'erro'

export interface EstatisticasAluno {
  xp: number
  nivel: number
  moedas: number
  ofensiva: number
  melhorOfensiva: number
  escudos: number
  ultimoDiaAtivo: string | null
  revisoesEmDiaTotal: number
}

export type AcaoDoDia =
  | { tipo: 'prova'; rotulo: string; alvo: { provaId: string; materiaId: string; capitulos: string[] } }
  | { tipo: 'revisaoProva'; rotulo: string; alvo: { provaId: string; materiaId: string; capitulos: string[] } }
  | { tipo: 'estudar'; rotulo: string; alvo: { quantidadeRevisoes: number } }
  | { tipo: 'continuar'; rotulo: string; alvo: { capituloId: string } }
  | { tipo: 'proximoCapitulo'; rotulo: string; alvo: { capituloId: string } }

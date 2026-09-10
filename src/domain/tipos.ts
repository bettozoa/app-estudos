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

export type AcaoDoDia =
  | { tipo: 'prova'; rotulo: string; alvo: { provaId: string; materiaId: string; capitulos: string[] } }
  | { tipo: 'revisaoProva'; rotulo: string; alvo: { provaId: string; materiaId: string; capitulos: string[] } }
  | { tipo: 'estudar'; rotulo: string; alvo: { quantidadeRevisoes: number } }
  | { tipo: 'continuar'; rotulo: string; alvo: { capituloId: string } }
  | { tipo: 'proximoCapitulo'; rotulo: string; alvo: { capituloId: string } }

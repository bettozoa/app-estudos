import { supabase } from './supabaseClient'

export interface MateriaRemota {
  id: string
  nome: string
  emoji: string
  cor: string
  ordem: number
}

export interface CapituloRemoto {
  id: string
  materia_id: string
  titulo: string
  livro: string | null
  paginas: string | null
  ordem: number
  publicado: boolean
}

export interface ModuloRemoto {
  id: string
  capitulo_id: string
  titulo: string
  ordem: number
}

export interface QuestaoRemota {
  id: string
  modulo_id: string
  tipo: 'mc' | 'vf' | 'assoc'
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

export async function buscarVersaoRemota(): Promise<number> {
  const { data, error } = await supabase.from('conteudo_versao').select('versao').eq('id', 1).single()
  if (error) throw error
  return data.versao
}

export interface ConteudoRemotoCompleto {
  materias: MateriaRemota[]
  capitulos: CapituloRemoto[]
  modulos: ModuloRemoto[]
  questoes: QuestaoRemota[]
}

export async function buscarConteudoCompleto(): Promise<ConteudoRemotoCompleto> {
  const [materias, capitulos, modulos, questoes] = await Promise.all([
    supabase.from('materias').select('*'),
    supabase.from('capitulos').select('*').eq('publicado', true),
    supabase.from('modulos').select('*'),
    supabase.from('questoes').select('*').eq('ativo', true),
  ])

  if (materias.error) throw materias.error
  if (capitulos.error) throw capitulos.error
  if (modulos.error) throw modulos.error
  if (questoes.error) throw questoes.error

  return { materias: materias.data, capitulos: capitulos.data, modulos: modulos.data, questoes: questoes.data }
}

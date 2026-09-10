import { supabase } from './supabaseClient'

export interface Aluno {
  id: string
  apelido: string
  serie: string | null
}

export async function listarAlunos(): Promise<Aluno[]> {
  const { data, error } = await supabase.from('alunos').select('id, apelido, serie').order('criado_em')
  if (error) throw error
  return data
}

export async function criarAluno(responsavelId: string, apelido: string, serie: string): Promise<Aluno> {
  const { data, error } = await supabase
    .from('alunos')
    .insert({ responsavel_id: responsavelId, apelido, serie: serie || null })
    .select('id, apelido, serie')
    .single()
  if (error) throw error
  return data
}

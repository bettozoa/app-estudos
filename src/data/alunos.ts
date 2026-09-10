import { supabase } from './supabaseClient'

export interface AvatarAluno {
  skinGato?: string
  skinsCompradas?: string[]
}

export interface Aluno {
  id: string
  apelido: string
  serie: string | null
  avatar: AvatarAluno | null
}

export async function listarAlunos(): Promise<Aluno[]> {
  const { data, error } = await supabase.from('alunos').select('id, apelido, serie, avatar').order('criado_em')
  if (error) throw error
  return data
}

export async function criarAluno(responsavelId: string, apelido: string, serie: string): Promise<Aluno> {
  const { data, error } = await supabase
    .from('alunos')
    .insert({ responsavel_id: responsavelId, apelido, serie: serie || null })
    .select('id, apelido, serie, avatar')
    .single()
  if (error) throw error
  return data
}

export async function atualizarAvatar(alunoId: string, avatar: AvatarAluno): Promise<void> {
  const { error } = await supabase.from('alunos').update({ avatar }).eq('id', alunoId)
  if (error) throw error
}

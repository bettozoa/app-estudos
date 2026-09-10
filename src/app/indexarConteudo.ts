import { db } from '../data/db'
import type { Questao } from '../domain/tipos'

export interface Modulo {
  id: string
  titulo: string
  ordem: number
}

export interface Capitulo {
  id: string
  materiaId: string
  titulo: string
  livro: string | null
  paginas: string | null
  ordem: number
  publicado: boolean
}

export interface CapituloComQuestoes extends Capitulo {
  modulos: Modulo[]
  questoes: Questao[]
}

export interface MateriaIndexada {
  id: string
  nome: string
  emoji: string
  cor: string
  capitulos: CapituloComQuestoes[]
}

// Lê o cache local de conteúdo (Dexie, populado por data/sincronizarConteudo.ts a partir do
// Supabase — Fase 3) e reagrupa por matéria/capítulo/módulo, na ordem certa.
export async function indexarConteudo(): Promise<MateriaIndexada[]> {
  const [materias, capitulos, modulos, questoes] = await Promise.all([
    db.conteudoMaterias.toArray(),
    db.conteudoCapitulos.toArray(),
    db.conteudoModulos.toArray(),
    db.conteudoQuestoes.toArray(),
  ])

  const capituloIdPorModuloId = new Map(modulos.map((m) => [m.id, m.capituloId]))

  return materias
    .slice()
    .sort((a, b) => a.ordem - b.ordem)
    .map((materia) => {
      const capitulosDaMateria = capitulos
        .filter((c) => c.materiaId === materia.id && c.publicado)
        .sort((a, b) => a.ordem - b.ordem)
        .map((capitulo) => ({
          ...capitulo,
          modulos: modulos.filter((m) => m.capituloId === capitulo.id).sort((a, b) => a.ordem - b.ordem),
          questoes: questoes.filter((q) => capituloIdPorModuloId.get(q.moduloId) === capitulo.id),
        }))

      return { id: materia.id, nome: materia.nome, emoji: materia.emoji, cor: materia.cor, capitulos: capitulosDaMateria }
    })
}

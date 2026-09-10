import { useEffect, useState } from 'react'
import { db } from '../data/db'
import { indexarConteudo } from './indexarConteudo'

const CAIXA_DOMINADA = 5

export interface NoModulo {
  id: string
  titulo: string
  status: 'bloqueado' | 'aberto' | 'dominado'
  percentualDominio: number
}

export interface NoCapitulo {
  id: string
  titulo: string
  percentualDominio: number
  modulos: NoModulo[]
}

export interface TrilhaMateria {
  id: string
  nome: string
  emoji: string
  cor: string
  capitulos: NoCapitulo[]
}

// Trilha de progresso (seção 7 do PLANO_APP_ESTUDOS.md): nós bloqueado → em andamento →
// dominado, com anel de domínio por módulo. Desbloqueio é sequencial dentro do capítulo — só
// o primeiro módulo ainda não dominado fica "aberto", os de depois ficam bloqueados.
export function useTrilha(alunoId: string, versao: number): TrilhaMateria[] | null {
  const [trilha, setTrilha] = useState<TrilhaMateria[] | null>(null)

  useEffect(() => {
    let cancelado = false
    Promise.all([indexarConteudo(), db.progresso.where('alunoId').equals(alunoId).toArray()]).then(([materias, linhas]) => {
      if (cancelado) return
      const caixaPorId = new Map(linhas.map((l) => [l.questaoId, l.caixa]))

      const resultado: TrilhaMateria[] = materias.map((materia) => ({
          id: materia.id,
          nome: materia.nome,
          emoji: materia.emoji,
          cor: materia.cor,
          capitulos: materia.capitulos.map((capitulo) => {
            let anteriorDominado = true // primeiro módulo do capítulo sempre pode abrir

            const modulos: NoModulo[] = capitulo.modulos.map((modulo) => {
              const questoesDoModulo = capitulo.questoes.filter((q) => q.moduloId === modulo.id)
              const dominadas = questoesDoModulo.filter((q) => (caixaPorId.get(q.id) ?? 0) >= CAIXA_DOMINADA).length
              const percentual = questoesDoModulo.length > 0 ? dominadas / questoesDoModulo.length : 0
              const dominado = percentual === 1
              const temProgresso = questoesDoModulo.some((q) => caixaPorId.has(q.id))

              const status: NoModulo['status'] = dominado ? 'dominado' : temProgresso || anteriorDominado ? 'aberto' : 'bloqueado'
              anteriorDominado = dominado

              return { id: modulo.id, titulo: modulo.titulo, status, percentualDominio: percentual }
            })

            const dominadasCap = capitulo.questoes.filter((q) => (caixaPorId.get(q.id) ?? 0) >= CAIXA_DOMINADA).length
            const percentualCap = capitulo.questoes.length > 0 ? dominadasCap / capitulo.questoes.length : 0

            return { id: capitulo.id, titulo: capitulo.titulo, percentualDominio: percentualCap, modulos }
          }),
        }))

      setTrilha(resultado)
    })
    return () => {
      cancelado = true
    }
  }, [alunoId, versao])

  return trilha
}

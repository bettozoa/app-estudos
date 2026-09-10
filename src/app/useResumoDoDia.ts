import { useEffect, useMemo, useState } from 'react'
import { db } from '../data/db'
import { indexarConteudo } from './indexarConteudo'
import { calcularResumoMateria, type ResumoMateria } from './resumoMateria'
import { formatarDataISO } from './utilAleatorio'

// `versao` é um gatilho manual de recarga: como o app ainda não usa live queries do Dexie,
// quem terminar uma sessão (ou uma sincronização) incrementa `versao` para forçar reler o
// progresso salvo.
export function useResumoDoDia(alunoId: string, hoje: Date, versao: number): ResumoMateria[] | null {
  const materias = useMemo(() => indexarConteudo(), [])
  const [resumos, setResumos] = useState<ResumoMateria[] | null>(null)
  const hojeISO = formatarDataISO(hoje)

  useEffect(() => {
    let cancelado = false
    db.progresso
      .where('alunoId')
      .equals(alunoId)
      .toArray()
      .then((progresso) => {
        if (cancelado) return
        const progressoPorId = new Map(progresso.map((p) => [p.questaoId, p]))
        setResumos(materias.map((materia) => calcularResumoMateria(materia, progressoPorId, hojeISO)))
      })
    return () => {
      cancelado = true
    }
  }, [alunoId, materias, hojeISO, versao])

  return resumos
}

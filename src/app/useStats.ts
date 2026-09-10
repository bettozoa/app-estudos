import { useEffect, useState } from 'react'
import { obterStats } from '../data/stats'
import type { LinhaStatsLocal } from '../data/db'

export function useStats(alunoId: string, versao: number): LinhaStatsLocal | null {
  const [stats, setStats] = useState<LinhaStatsLocal | null>(null)

  useEffect(() => {
    let cancelado = false
    obterStats(alunoId).then((s) => {
      if (!cancelado) setStats(s)
    })
    return () => {
      cancelado = true
    }
  }, [alunoId, versao])

  return stats
}

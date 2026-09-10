import { useEffect, useRef } from 'react'
import { sincronizar } from '../data/sync'

const INTERVALO_MS = 15 * 60 * 1000

// Dispara sync ao montar, quando o aparelho volta a ficar online, e a cada 15 min com o
// app aberto (seção 5 do PLANO_APP_ESTUDOS.md não fixa um valor exato para X — 15 min é o
// que propus). `aoAtualizar` deixa quem chamou recarregar o que depende do progresso local.
export function useSincronizacao(alunoId: string, aoAtualizar: () => void): void {
  const aoAtualizarRef = useRef(aoAtualizar)
  aoAtualizarRef.current = aoAtualizar

  useEffect(() => {
    let cancelado = false

    async function rodar() {
      try {
        await sincronizar(alunoId)
        if (!cancelado) aoAtualizarRef.current()
      } catch (erro) {
        console.error('[sync] falhou o pull, tenta de novo no próximo gatilho:', erro)
      }
    }

    rodar()
    window.addEventListener('online', rodar)
    const intervalo = setInterval(rodar, INTERVALO_MS)

    return () => {
      cancelado = true
      window.removeEventListener('online', rodar)
      clearInterval(intervalo)
    }
  }, [alunoId])
}

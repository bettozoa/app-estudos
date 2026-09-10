import { useEffect, useRef, useState } from 'react'
import { db } from '../data/db'
import { sincronizarConteudoSeNecessario } from '../data/sincronizarConteudo'
import { sincronizar } from '../data/sync'

const INTERVALO_MS = 15 * 60 * 1000

// Dispara sync ao montar, quando o aparelho volta a ficar online, e a cada 15 min com o
// app aberto (seção 5 do PLANO_APP_ESTUDOS.md não fixa um valor exato para X — 15 min é o
// que propus). `aoAtualizar` deixa quem chamou recarregar o que depende do progresso e/ou do
// conteúdo local (Fase 3: conteúdo agora vem do Supabase, comparado por versão).
//
// Retorna se já dá pra mostrar a tela. Se já existe conteúdo em cache, isso é imediato — não
// trava esperando a rede, porque offline o `fetch()` do navegador pode levar 20-30s pra
// desistir (não é retry do Supabase, é o timeout de conexão do próprio Chrome). Só espera a
// primeira rodada terminar de verdade quando o cache está genuinamente vazio (aparelho novo).
export function useSincronizacao(alunoId: string, aoAtualizar: () => void): boolean {
  const aoAtualizarRef = useRef(aoAtualizar)
  aoAtualizarRef.current = aoAtualizar
  const [pronto, setPronto] = useState(false)

  useEffect(() => {
    let cancelado = false

    async function rodar() {
      let mudouAlgo = false

      try {
        await sincronizar(alunoId)
        mudouAlgo = true
      } catch (erro) {
        console.error('[sync] falhou o pull de progresso, tenta de novo no próximo gatilho:', erro)
      }

      try {
        if (await sincronizarConteudoSeNecessario()) mudouAlgo = true
      } catch (erro) {
        console.error('[sync] falhou o pull de conteúdo, tenta de novo no próximo gatilho:', erro)
      }

      if (cancelado) return
      if (mudouAlgo) aoAtualizarRef.current()
      setPronto(true)
    }

    db.conteudoMaterias.count().then((quantidade) => {
      if (quantidade > 0 && !cancelado) setPronto(true)
    })

    rodar()
    window.addEventListener('online', rodar)
    const intervalo = setInterval(rodar, INTERVALO_MS)

    return () => {
      cancelado = true
      window.removeEventListener('online', rodar)
      clearInterval(intervalo)
    }
  }, [alunoId])

  return pronto
}

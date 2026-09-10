import type { Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { supabase } from '../data/supabaseClient'

// Chave usada pelo supabase-js pra persistir a sessão (formato "sb-<project-ref>-auth-token").
const CHAVE_STORAGE = `sb-${new URL(import.meta.env.VITE_SUPABASE_URL).hostname.split('.')[0]}-auth-token`

function lerSessaoDoStorage(): Session | null {
  try {
    const bruto = localStorage.getItem(CHAVE_STORAGE)
    return bruto ? (JSON.parse(bruto) as Session) : null
  } catch {
    return null
  }
}

// Lê a sessão direto do localStorage pra decidir a tela inicial na hora, sem esperar a
// inicialização assíncrona do supabase-js: offline, ela pode tentar renovar o token e ficar
// pendurada esperando uma rede que não existe, travando o app inteiro em "Carregando...".
// onAuthStateChange continua assinado pra manter a sessão atualizada quando/se resolver.
export function useAuth(): Session | null {
  const [sessao, setSessao] = useState<Session | null>(() => lerSessaoDoStorage())

  useEffect(() => {
    const { data: assinatura } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      setSessao(novaSessao)
    })

    return () => assinatura.subscription.unsubscribe()
  }, [])

  return sessao
}

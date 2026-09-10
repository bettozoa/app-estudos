import { useState, type FormEvent } from 'react'
import { BotaoPrincipal, Card, cores, Mascote } from '../design'
import { supabase } from '../data/supabaseClient'

const EMAIL_FAMILIA = import.meta.env.VITE_FAMILIA_EMAIL

// Sem e-mail nem link mágico: é uma família de 2-3 pessoas, então um PIN fixo (senha da
// única conta responsável) já resolve — só precisa ser digitado uma vez por aparelho, depois
// a sessão fica salva e cai direto na escolha do perfil da criança.
export function Entrada() {
  const [pin, setPin] = useState('')
  const [entrando, setEntrando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function entrar(evento: FormEvent) {
    evento.preventDefault()
    setErro(null)
    setEntrando(true)
    const { error } = await supabase.auth.signInWithPassword({ email: EMAIL_FAMILIA, password: pin })
    setEntrando(false)
    if (error) {
      setErro('PIN incorreto. Tenta de novo.')
      setPin('')
      return
    }
  }

  return (
    <main
      className="tela-com-fade mx-auto flex max-w-md flex-col items-center gap-4 p-5"
      style={{ backgroundColor: cores.fundo, minHeight: '100vh', color: cores.contorno }}
    >
      <Mascote estado="acenando" />
      <p className="text-xl font-extrabold">App de Estudos</p>

      <Card className="flex w-full flex-col gap-3">
        <form onSubmit={entrar} className="flex flex-col gap-3">
          <label htmlFor="pin" className="text-sm font-bold">
            Digite o PIN da família
          </label>
          <input
            id="pin"
            type="password"
            inputMode="numeric"
            autoComplete="current-password"
            required
            minLength={6}
            value={pin}
            onChange={(evento) => setPin(evento.target.value)}
            placeholder="••••••"
            className="rounded-lg p-3 text-center text-2xl tracking-[0.5em]"
            style={{ border: `3px solid ${cores.contorno}` }}
          />
          {erro && (
            <p className="text-sm font-bold" style={{ color: cores.laranja }}>
              {erro}
            </p>
          )}
          <BotaoPrincipal type="submit" disabled={entrando}>
            {entrando ? 'Entrando...' : 'Entrar'}
          </BotaoPrincipal>
        </form>
      </Card>
    </main>
  )
}

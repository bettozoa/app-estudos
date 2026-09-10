import { useState, type FormEvent } from 'react'
import { BotaoPrincipal, Card, cores, Mascote } from '../design'
import { supabase } from '../data/supabaseClient'

export function Entrada() {
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function enviarLink(evento: FormEvent) {
    evento.preventDefault()
    setErro(null)
    setEnviando(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    setEnviando(false)
    if (error) {
      setErro(error.message)
      return
    }
    setEnviado(true)
  }

  return (
    <main
      className="mx-auto flex max-w-md flex-col items-center gap-4 p-5"
      style={{ backgroundColor: cores.fundo, minHeight: '100vh', color: cores.contorno }}
    >
      <Mascote estado="acenando" />
      <p className="text-xl font-extrabold">Entrar no App de Estudos</p>

      <Card className="flex w-full flex-col gap-3">
        {enviado ? (
          <>
            <p className="font-extrabold">Verifique seu e-mail! 📩</p>
            <p className="text-sm">
              Mandamos um link mágico para <strong>{email}</strong>. Abra no mesmo aparelho pra entrar — não precisa de senha.
            </p>
          </>
        ) : (
          <form onSubmit={enviarLink} className="flex flex-col gap-3">
            <label htmlFor="email" className="text-sm font-bold">
              E-mail do responsável
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
              placeholder="seuemail@exemplo.com"
              className="rounded-lg p-3 text-base"
              style={{ border: `3px solid ${cores.contorno}` }}
            />
            {erro && (
              <p className="text-sm font-bold" style={{ color: cores.laranja }}>
                {erro}
              </p>
            )}
            <BotaoPrincipal type="submit" disabled={enviando}>
              {enviando ? 'Enviando...' : 'Entrar com link mágico'}
            </BotaoPrincipal>
          </form>
        )}
      </Card>
    </main>
  )
}

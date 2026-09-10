import { BotaoPrincipal, Card, cores, Mascote } from '../design'
import { useSessaoStore } from '../estado/sessaoStore'

interface FimDeSessaoProps {
  onContinuar: () => void
}

export function FimDeSessao({ onContinuar }: FimDeSessaoProps) {
  const acertos = useSessaoStore((s) => s.acertos)
  const erros = useSessaoStore((s) => s.erros)
  const total = acertos + erros
  const percentual = total > 0 ? Math.round((acertos / total) * 100) : 0

  return (
    <main
      className="mx-auto flex max-w-md flex-col items-center gap-4 p-5 text-center"
      style={{ backgroundColor: cores.fundo, minHeight: '100vh', color: cores.contorno }}
    >
      <Mascote estado={percentual >= 70 ? 'comemorando' : 'encorajando'} />
      <h1 className="text-xl font-extrabold">Sessão concluída!</h1>

      <Card className="flex w-full flex-col gap-2">
        <p className="text-lg font-bold">
          ✅ {acertos} acerto(s) · ❌ {erros} erro(s)
        </p>
        <p className="text-sm">Desempenho: {percentual}%</p>
      </Card>

      <BotaoPrincipal onClick={onContinuar}>Voltar para Hoje</BotaoPrincipal>
    </main>
  )
}

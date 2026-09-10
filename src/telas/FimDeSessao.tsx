import { CONQUISTAS } from '../app/conquistasInfo'
import { BotaoPrincipal, Card, Confete, cores, Mascote, Pilula } from '../design'
import { useSessaoStore } from '../estado/sessaoStore'

interface FimDeSessaoProps {
  onContinuar: () => void
}

export function FimDeSessao({ onContinuar }: FimDeSessaoProps) {
  const acertos = useSessaoStore((s) => s.acertos)
  const erros = useSessaoStore((s) => s.erros)
  const xpGanho = useSessaoStore((s) => s.xpGanho)
  const moedasGanhas = useSessaoStore((s) => s.moedasGanhas)
  const ofensivaAtual = useSessaoStore((s) => s.ofensivaAtual)
  const conquistasNovas = useSessaoStore((s) => s.conquistasNovas)

  const total = acertos + erros
  const percentual = total > 0 ? Math.round((acertos / total) * 100) : 0
  const houveConquista = conquistasNovas.length > 0

  return (
    <main
      className="mx-auto flex max-w-md flex-col items-center gap-4 p-5 text-center"
      style={{ backgroundColor: cores.fundo, minHeight: '100vh', color: cores.contorno }}
    >
      {houveConquista && <Confete />}

      <Mascote estado={percentual >= 70 ? 'comemorando' : 'encorajando'} />
      <h1 className="text-xl font-extrabold">Sessão concluída!</h1>

      <Card className="flex w-full flex-col gap-2">
        <p className="text-lg font-bold">
          ✅ {acertos} acerto(s) · ❌ {erros} erro(s)
        </p>
        <p className="text-sm">Desempenho: {percentual}%</p>
      </Card>

      <div className="flex flex-wrap justify-center gap-2">
        <Pilula cor={cores.amarelo}>⭐ +{xpGanho} XP</Pilula>
        {moedasGanhas > 0 && <Pilula>🪙 +{moedasGanhas}</Pilula>}
        <Pilula cor={cores.laranja}>🔥 {ofensivaAtual} dia(s)</Pilula>
      </div>

      {houveConquista && (
        <Card className="flex w-full flex-col gap-2">
          <p className="font-extrabold">Conquista nova! 🎉</p>
          {conquistasNovas.map((codigo) => {
            const info = CONQUISTAS[codigo]
            if (!info) return null
            return (
              <p key={codigo} className="text-sm">
                {info.icone} <strong>{info.nome}</strong> — {info.descricao}
              </p>
            )
          })}
        </Card>
      )}

      <BotaoPrincipal onClick={onContinuar}>Voltar para Hoje</BotaoPrincipal>
    </main>
  )
}

import { CONQUISTAS } from '../app/conquistasInfo'
import { BotaoPrincipal, Card, Confete, cores, Mascote, Pilula } from '../design'
import { useSessaoStore } from '../estado/sessaoStore'

interface FimDeSessaoProps {
  onContinuar: () => void
}

function fraseDoGato(percentual: number, total: number): string {
  if (total === 0) return 'Treino livre concluído!'
  if (percentual >= 90) return 'Mandou muito bem hoje! 🌟'
  if (percentual >= 70) return 'Muito bem, continue assim!'
  if (percentual >= 50) return 'Foi treino pesado hoje — cada erro é um passo pra aprender!'
  return 'Dia difícil, mas você não desistiu! Vamos de novo amanhã.'
}

export function FimDeSessao({ onContinuar }: FimDeSessaoProps) {
  const acertos = useSessaoStore((s) => s.acertos)
  const erros = useSessaoStore((s) => s.erros)
  const xpGanho = useSessaoStore((s) => s.xpGanho)
  const moedasGanhas = useSessaoStore((s) => s.moedasGanhas)
  const ofensivaAtual = useSessaoStore((s) => s.ofensivaAtual)
  const conquistasNovas = useSessaoStore((s) => s.conquistasNovas)
  const erradas = useSessaoStore((s) => s.erradas)

  const total = acertos + erros
  const percentual = total > 0 ? Math.round((acertos / total) * 100) : 0
  const houveConquista = conquistasNovas.length > 0

  return (
    <main
      className="tela-com-fade mx-auto flex max-w-md flex-col items-center gap-4 p-5 text-center"
      style={{ backgroundColor: cores.fundo, minHeight: '100vh', color: cores.contorno }}
    >
      {houveConquista && <Confete />}

      <Mascote estado={percentual >= 70 ? 'comemorando' : 'encorajando'} />
      <h1 className="text-xl font-extrabold">{fraseDoGato(percentual, total)}</h1>

      <Card className="w-full">
        <p className="text-lg font-bold">
          ✅ {acertos} acerto(s) · ❌ {erros} erro(s)
        </p>
      </Card>

      <div className="animar-entrada flex flex-wrap justify-center gap-2">
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

      {erradas.length > 0 && (
        <Card className="flex w-full flex-col gap-3 text-left">
          <p className="text-center font-extrabold">O que escapou hoje</p>
          {erradas.map((questao) => (
            <div key={questao.id} className="flex flex-col gap-1 rounded-lg p-2" style={{ backgroundColor: cores.erroFundo }}>
              <p className="text-sm font-bold">{questao.enunciado}</p>
              <p className="text-xs">{questao.explicacao}</p>
              <p className="text-xs opacity-70">Fonte: {questao.fonte}</p>
            </div>
          ))}
        </Card>
      )}

      <BotaoPrincipal onClick={onContinuar}>Voltar para Hoje</BotaoPrincipal>
    </main>
  )
}

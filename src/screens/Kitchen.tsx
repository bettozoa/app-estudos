import { useState } from 'react'
import {
  BarraProgresso,
  BotaoPrincipal,
  Card,
  CartaoAlternativa,
  Confete,
  cores,
  Mascote,
  materiaCores,
  Pilula,
  type EstadoMascote,
} from '../design'

const ESTADOS: EstadoMascote[] = ['acenando', 'comemorando', 'pensando', 'encorajando', 'dormindo']

export function Kitchen() {
  const [alternativaEscolhida, setAlternativaEscolhida] = useState<'neutro' | 'certa' | 'errada'>('neutro')
  const [confeteKey, setConfeteKey] = useState<number | null>(null)

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 p-6" style={{ backgroundColor: cores.fundo, color: cores.contorno }}>
      <h1 className="text-2xl font-extrabold">Kitchen sink — componentes base</h1>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">Mascote — todos os estados</h2>
        <div className="flex flex-wrap gap-6">
          {ESTADOS.map((estado) => (
            <div key={estado} className="flex flex-col items-center gap-1">
              <Mascote estado={estado} />
              <span className="text-sm font-bold">{estado}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">BotaoPrincipal</h2>
        <BotaoPrincipal>Estudar hoje</BotaoPrincipal>
        <BotaoPrincipal variante="secundaria">Trocar de matéria</BotaoPrincipal>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">Card</h2>
        <Card>
          <p className="font-bold">Continuar capítulo</p>
          <p className="text-sm">Espaço para conteúdo dentro do card.</p>
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">CartaoAlternativa</h2>
        <div className="flex flex-col gap-2">
          {(['neutro', 'certa', 'errada'] as const).map((estado) => (
            <CartaoAlternativa key={estado} estado={estado} onClick={() => setAlternativaEscolhida(estado)}>
              Alternativa — estado "{estado}"
            </CartaoAlternativa>
          ))}
        </div>
        <p className="text-sm">Última clicada: {alternativaEscolhida}</p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">BarraProgresso</h2>
        <BarraProgresso progresso={0.65} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">Pilula</h2>
        <div className="flex flex-wrap gap-2">
          <Pilula cor={cores.amarelo}>🔥 5 dias</Pilula>
          <Pilula cor={cores.amarelo}>⭐ 120 XP</Pilula>
          <Pilula>🪙 34</Pilula>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">Confete (respeita prefers-reduced-motion)</h2>
        {confeteKey !== null && <Confete key={confeteKey} />}
        <BotaoPrincipal variante="secundaria" onClick={() => setConfeteKey((k) => (k ?? 0) + 1)}>
          Disparar confete
        </BotaoPrincipal>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">Cores por matéria</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(materiaCores).map(([materia, cor]) => (
            <span
              key={materia}
              className="rounded-full px-3 py-1 text-sm font-bold text-white"
              style={{ backgroundColor: cor, border: `3px solid ${cores.contorno}` }}
            >
              {materia}
            </span>
          ))}
        </div>
      </section>
    </main>
  )
}

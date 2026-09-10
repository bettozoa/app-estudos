import { useTrilha, type NoModulo } from '../app/useTrilha'
import { BotaoPrincipal, Card, cores } from '../design'

interface TrilhaProps {
  alunoId: string
  versao: number
  onVoltar: () => void
}

export function Trilha({ alunoId, versao, onVoltar }: TrilhaProps) {
  const trilha = useTrilha(alunoId, versao)

  if (!trilha) {
    return <div className="p-6 text-center">Carregando...</div>
  }

  return (
    <main
      className="mx-auto flex max-w-md flex-col gap-4 p-5"
      style={{ backgroundColor: cores.fundo, minHeight: '100vh', color: cores.contorno }}
    >
      <h1 className="text-xl font-extrabold">Trilha</h1>

      {trilha.map((materia) => (
        <div key={materia.id} className="flex flex-col gap-2">
          <p className="text-lg font-extrabold" style={{ color: materia.cor }}>
            {materia.emoji} {materia.nome}
          </p>

          {materia.capitulos.map((capitulo) => (
            <Card key={capitulo.id} className="flex flex-col gap-2">
              <p className="font-bold">{capitulo.titulo}</p>
              <p className="text-xs opacity-70">{Math.round(capitulo.percentualDominio * 100)}% dominado</p>
              <div className="flex flex-wrap gap-3">
                {capitulo.modulos.map((modulo) => (
                  <NoModuloVisual key={modulo.id} no={modulo} cor={materia.cor} />
                ))}
              </div>
            </Card>
          ))}
        </div>
      ))}

      <BotaoPrincipal variante="secundaria" onClick={onVoltar}>
        Voltar
      </BotaoPrincipal>
    </main>
  )
}

function NoModuloVisual({ no, cor }: { no: NoModulo; cor: string }) {
  const raio = 18
  const circunferencia = 2 * Math.PI * raio
  const preenchido = circunferencia * no.percentualDominio
  const corAnel = no.status === 'dominado' ? cores.verde : cor
  const icone = no.status === 'dominado' ? '⭐' : no.status === 'bloqueado' ? '🔒' : '📖'

  return (
    <div className="flex w-16 flex-col items-center gap-1" style={{ opacity: no.status === 'bloqueado' ? 0.45 : 1 }}>
      <svg width={48} height={48} viewBox="0 0 48 48">
        <circle cx={24} cy={24} r={raio} fill={cores.superficie} stroke={cores.contorno} strokeWidth={3} />
        <circle
          cx={24}
          cy={24}
          r={raio}
          fill="none"
          stroke={corAnel}
          strokeWidth={4}
          strokeDasharray={`${preenchido} ${circunferencia}`}
          strokeLinecap="round"
          transform="rotate(-90 24 24)"
        />
        <text x={24} y={29} textAnchor="middle" fontSize={16}>
          {icone}
        </text>
      </svg>
      <span className="text-center text-[10px] leading-tight font-bold">{no.titulo}</span>
    </div>
  )
}

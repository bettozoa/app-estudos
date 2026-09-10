import { useTrilha, type NoModulo } from '../app/useTrilha'
import { BotaoPrincipal, Card, cores, IconeCadeado, IconeEstrela, IconeLivro } from '../design'

interface TrilhaProps {
  alunoId: string
  versao: number
  onVoltar: () => void
}

export function Trilha({ alunoId, versao, onVoltar }: TrilhaProps) {
  const trilha = useTrilha(alunoId, versao)

  if (!trilha) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-2" style={{ backgroundColor: cores.fundo }}>
        <img src="/mascote/webp/parado.webp" alt="" width={72} height={72} />
        <p style={{ color: cores.contorno }}>Carregando a trilha...</p>
      </main>
    )
  }

  return (
    <main
      className="tela-com-fade mx-auto flex max-w-md flex-col gap-4 p-5"
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

  return (
    <div className="flex w-16 flex-col items-center gap-1" style={{ opacity: no.status === 'bloqueado' ? 0.45 : 1 }}>
      <svg width={48} height={48} viewBox="0 0 48 48">
        <circle cx={24} cy={24} r={raio} fill={cores.superficie} stroke={cores.contorno} strokeWidth={3} />
        {preenchido > 0 && (
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
        )}
        <foreignObject x={12} y={12} width={24} height={24}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
            {no.status === 'dominado' ? (
              <IconeEstrela tamanho={18} />
            ) : no.status === 'bloqueado' ? (
              <IconeCadeado tamanho={18} />
            ) : (
              <IconeLivro tamanho={18} cor={cor} />
            )}
          </div>
        </foreignObject>
      </svg>
      <span className="text-center text-[10px] leading-tight font-bold">{no.titulo}</span>
    </div>
  )
}

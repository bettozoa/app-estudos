import { cores } from './tokens'

interface BarraProgressoProps {
  progresso: number // 0..1
  corPreenchimento?: string
}

export function BarraProgresso({ progresso, corPreenchimento = cores.amarelo }: BarraProgressoProps) {
  const percentual = Math.round(Math.min(Math.max(progresso, 0), 1) * 100)

  return (
    <div
      role="progressbar"
      aria-valuenow={percentual}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-3.5 w-full overflow-hidden rounded-full"
      style={{ backgroundColor: cores.superficie, border: `3px solid ${cores.contorno}` }}
    >
      <div
        className="h-full rounded-full transition-[width] duration-300"
        style={{ width: `${percentual}%`, backgroundColor: corPreenchimento }}
      />
    </div>
  )
}

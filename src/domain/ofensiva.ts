const META_ESCUDO_A_CADA_DIAS = 7
const ESCUDOS_MAXIMOS = 2

export interface EstadoOfensiva {
  ofensiva: number
  melhorOfensiva: number
  escudos: number
  ultimoDiaAtivo: string | null // 'YYYY-MM-DD'
}

// Seção 7 do PLANO_APP_ESTUDOS.md: meta diária pequena, escudo perdoa 1 dia perdido
// automaticamente (máx. 2 guardados), ganha 1 escudo a cada 7 dias seguidos.
export function atualizarOfensiva(estado: EstadoOfensiva, hojeISO: string): EstadoOfensiva {
  if (estado.ultimoDiaAtivo === hojeISO) {
    return estado // já contou hoje — idempotente, chamar de novo não infla a ofensiva
  }

  const diasSemEstudar = estado.ultimoDiaAtivo === null ? null : diferencaEmDias(hojeISO, estado.ultimoDiaAtivo)

  let novaOfensiva: number
  let escudosRestantes = estado.escudos

  if (diasSemEstudar === null) {
    novaOfensiva = 1 // primeiro dia de uso
  } else if (diasSemEstudar === 1) {
    novaOfensiva = estado.ofensiva + 1 // dia seguinte, sequência normal
  } else if (diasSemEstudar === 2 && estado.escudos > 0) {
    novaOfensiva = estado.ofensiva + 1 // perdoa 1 dia perdido, gasta 1 escudo
    escudosRestantes -= 1
  } else {
    novaOfensiva = 1 // sequência quebrada (sem escudo, ou perdeu mais de 1 dia)
  }

  if (novaOfensiva > 0 && novaOfensiva % META_ESCUDO_A_CADA_DIAS === 0 && escudosRestantes < ESCUDOS_MAXIMOS) {
    escudosRestantes += 1
  }

  return {
    ofensiva: novaOfensiva,
    melhorOfensiva: Math.max(estado.melhorOfensiva, novaOfensiva),
    escudos: escudosRestantes,
    ultimoDiaAtivo: hojeISO,
  }
}

function diferencaEmDias(hojeISO: string, dataISO: string): number {
  const hoje = new Date(`${hojeISO}T00:00:00`)
  const data = new Date(`${dataISO}T00:00:00`)
  return Math.round((hoje.getTime() - data.getTime()) / 86_400_000)
}

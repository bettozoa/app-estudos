import type { AcaoDoDia, CapituloProgresso, Prova } from './tipos'

// Único lugar que decide o que a tela "Hoje" mostra (seção 5 do PLANO_VISUAL.md).
// Ordem de prioridade: prova próxima > revisão vencida > continuar capítulo > próximo capítulo.
export function decidirAcaoDoDia(
  revisoesVencidas: number,
  capituloAtual: CapituloProgresso,
  provasProximas: Prova[],
  hoje: Date,
): AcaoDoDia {
  const prova = encontrarProvaRelevante(provasProximas, hoje)
  if (prova) {
    const diasParaProva = diferencaEmDias(new Date(`${prova.data}T00:00:00`), hoje)
    const alvo = { provaId: prova.id, materiaId: prova.materiaId, capitulos: prova.capitulos }
    if (diasParaProva === 1) {
      return { tipo: 'revisaoProva', rotulo: `Revisão de prova de ${prova.materiaNome}`, alvo }
    }
    return { tipo: 'prova', rotulo: `Treinar para a prova de ${prova.materiaNome}`, alvo }
  }

  if (revisoesVencidas > 0) {
    return { tipo: 'estudar', rotulo: 'Estudar hoje', alvo: { quantidadeRevisoes: revisoesVencidas } }
  }

  if (capituloAtual.progresso < 1) {
    return { tipo: 'continuar', rotulo: 'Continuar capítulo', alvo: { capituloId: capituloAtual.capituloId } }
  }

  if (capituloAtual.proximoCapituloId) {
    return { tipo: 'proximoCapitulo', rotulo: 'Começar novo capítulo', alvo: { capituloId: capituloAtual.proximoCapituloId } }
  }

  return { tipo: 'continuar', rotulo: 'Treinar de novo', alvo: { capituloId: capituloAtual.capituloId } }
}

function diferencaEmDias(data: Date, hoje: Date): number {
  const dataSemHora = new Date(data.getFullYear(), data.getMonth(), data.getDate())
  const hojeSemHora = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
  return Math.round((dataSemHora.getTime() - hojeSemHora.getTime()) / 86_400_000)
}

// Prova relevante: entre amanhã e os próximos 7 dias. No dia da prova ou depois dela,
// deixa de ser relevante e o fluxo volta ao normal ("some sozinho", seção 5 do PLANO_VISUAL.md).
function encontrarProvaRelevante(provas: Prova[], hoje: Date): Prova | null {
  const candidatas = provas
    .map((prova) => ({ prova, diasParaProva: diferencaEmDias(new Date(`${prova.data}T00:00:00`), hoje) }))
    .filter(({ diasParaProva }) => diasParaProva >= 1 && diasParaProva <= 7)
    .sort((a, b) => a.diasParaProva - b.diasParaProva)

  return candidatas[0]?.prova ?? null
}

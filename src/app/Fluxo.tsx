import { useMemo, useState } from 'react'
import { montarSessao } from '../domain/sessao'
import { useSessaoStore } from '../estado/sessaoStore'
import { FimDeSessao } from '../telas/FimDeSessao'
import { Hoje } from '../telas/Hoje'
import { Sessao } from '../telas/Sessao'
import { useResumoDoDia } from './useResumoDoDia'
import { embaralhar } from './utilAleatorio'

type Etapa = { tipo: 'hoje' } | { tipo: 'sessao' } | { tipo: 'fim' }

const TAMANHO_SESSAO = 20

export function Fluxo() {
  const hoje = useMemo(() => new Date(), [])
  const [etapa, setEtapa] = useState<Etapa>({ tipo: 'hoje' })
  const [versao, setVersao] = useState(0)
  const resumos = useResumoDoDia(hoje, versao)

  if (!resumos) {
    return <div className="p-6 text-center">Carregando...</div>
  }

  function iniciarEstudo(materiaId: string) {
    const resumo = resumos!.find((r) => r.materia.id === materiaId)
    if (!resumo || !resumo.capituloAtual) return

    let fila = montarSessao(resumo.revisoesVencidas, resumo.questoesNovas, { tamanhoAlvo: TAMANHO_SESSAO })
    if (fila.length === 0) {
      // Nada vencido e nada novo: treino livre com o capítulo inteiro (seção 6 do PLANO_APP_ESTUDOS.md).
      fila = embaralhar(resumo.capituloAtual.questoes).slice(0, TAMANHO_SESSAO)
    }

    useSessaoStore.getState().iniciar({ fila, materiaId, capituloId: resumo.capituloAtual.id })
    setEtapa({ tipo: 'sessao' })
  }

  function finalizarSessao() {
    setEtapa({ tipo: 'fim' })
  }

  function voltarParaHoje() {
    setVersao((v) => v + 1)
    setEtapa({ tipo: 'hoje' })
  }

  switch (etapa.tipo) {
    case 'sessao':
      return <Sessao onFinalizar={finalizarSessao} />
    case 'fim':
      return <FimDeSessao onContinuar={voltarParaHoje} />
    default:
      return <Hoje resumos={resumos} hoje={hoje} onEstudar={iniciarEstudo} />
  }
}

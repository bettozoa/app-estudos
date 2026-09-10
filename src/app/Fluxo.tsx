import { useMemo, useState } from 'react'
import type { Aluno } from '../data/alunos'
import { db } from '../data/db'
import { listarConquistasObtidas, registrarConquistasNovas, registrarOfensivaDoDia } from '../data/stats'
import { sincronizarConquistas } from '../data/sync'
import { avaliarConquistas } from '../domain/conquistas'
import { montarSessao } from '../domain/sessao'
import { useSessaoStore } from '../estado/sessaoStore'
import { FimDeSessao } from '../telas/FimDeSessao'
import { Hoje } from '../telas/Hoje'
import { Sessao } from '../telas/Sessao'
import { Trilha } from '../telas/Trilha'
import { indexarConteudo, type CapituloComQuestoes } from './indexarConteudo'
import { algumModuloRecemDominado, capituloDominado, tirarSnapshotCapitulo } from './progressoCapitulo'
import { calcularResumoMateria } from './resumoMateria'
import { useResumoDoDia } from './useResumoDoDia'
import { useSincronizacao } from './useSincronizacao'
import { embaralhar, formatarDataISO } from './utilAleatorio'

type Etapa = { tipo: 'hoje' } | { tipo: 'sessao' } | { tipo: 'fim' } | { tipo: 'trilha' }

const TAMANHO_SESSAO = 20

interface FluxoProps {
  aluno: Aluno
}

export function Fluxo({ aluno }: FluxoProps) {
  const hoje = useMemo(() => new Date(), [])
  const [etapa, setEtapa] = useState<Etapa>({ tipo: 'hoje' })
  const [versao, setVersao] = useState(0)
  const [capituloEmEstudo, setCapituloEmEstudo] = useState<CapituloComQuestoes | null>(null)
  const [snapshotAntes, setSnapshotAntes] = useState<Map<string, number>>(new Map())
  const resumos = useResumoDoDia(aluno.id, hoje, versao)
  const sincronizacaoInicialPronta = useSincronizacao(aluno.id, () => setVersao((v) => v + 1))

  if (!sincronizacaoInicialPronta || !resumos) {
    return <div className="p-6 text-center">Carregando...</div>
  }

  async function iniciarEstudo(materiaId: string) {
    const resumo = resumos!.find((r) => r.materia.id === materiaId)
    if (!resumo || !resumo.capituloAtual) return

    let fila = montarSessao(resumo.revisoesVencidas, resumo.questoesNovas, { tamanhoAlvo: TAMANHO_SESSAO })
    if (fila.length === 0) {
      // Nada vencido e nada novo: treino livre com o capítulo inteiro (seção 6 do PLANO_APP_ESTUDOS.md).
      fila = embaralhar(resumo.capituloAtual.questoes).slice(0, TAMANHO_SESSAO)
    }

    setCapituloEmEstudo(resumo.capituloAtual)
    setSnapshotAntes(await tirarSnapshotCapitulo(aluno.id, resumo.capituloAtual))
    useSessaoStore.getState().iniciar({ fila, alunoId: aluno.id, materiaId, capituloId: resumo.capituloAtual.id })
    setEtapa({ tipo: 'sessao' })
  }

  async function finalizarSessao() {
    const stats = await registrarOfensivaDoDia(aluno.id, hoje)

    let moduloConcluidoAgora = false
    let capituloDominadoAgora = false
    if (capituloEmEstudo) {
      const snapshotDepois = await tirarSnapshotCapitulo(aluno.id, capituloEmEstudo)
      moduloConcluidoAgora = algumModuloRecemDominado(capituloEmEstudo, snapshotAntes, snapshotDepois)
      capituloDominadoAgora = capituloDominado(capituloEmEstudo, snapshotDepois) && !capituloDominado(capituloEmEstudo, snapshotAntes)
    }

    const todosProgresso = await db.progresso.where('alunoId').equals(aluno.id).toArray()
    const progressoPorId = new Map(todosProgresso.map((p) => [p.questaoId, p]))
    const materiasIndexadas = await indexarConteudo()
    const hojeISO = formatarDataISO(hoje)
    const resumosFrescos = materiasIndexadas.map((m) => calcularResumoMateria(m, progressoPorId, hojeISO))
    const filaVazia = resumosFrescos.every((r) => r.revisoesVencidas.length === 0)
    const materiasComProgresso = materiasIndexadas.filter((m) =>
      m.capitulos.some((c) => c.questoes.some((q) => progressoPorId.has(q.id))),
    ).length

    const conquistasJaObtidas = await listarConquistasObtidas(aluno.id)
    const novas = avaliarConquistas({
      moduloConcluidoAgora,
      capituloDominadoAgora,
      ofensivaAtual: stats.ofensiva,
      revisoesEmDiaTotal: stats.revisoesEmDiaTotal,
      filaVazia,
      maiorSequenciaAcertosNaSessao: useSessaoStore.getState().maiorSequencia,
      materiasComProgresso,
      conquistasJaObtidas,
    })
    await registrarConquistasNovas(aluno.id, novas, hoje)
    void sincronizarConquistas(aluno.id)

    useSessaoStore.getState().finalizar({ ofensivaAtual: stats.ofensiva, melhorOfensiva: stats.melhorOfensiva, conquistasNovas: novas })
    setEtapa({ tipo: 'fim' })
  }

  function voltarParaHoje() {
    setVersao((v) => v + 1)
    setEtapa({ tipo: 'hoje' })
  }

  switch (etapa.tipo) {
    case 'sessao':
      return <Sessao onFinalizar={finalizarSessao} onSair={voltarParaHoje} />
    case 'fim':
      return <FimDeSessao onContinuar={voltarParaHoje} />
    case 'trilha':
      return <Trilha alunoId={aluno.id} versao={versao} onVoltar={() => setEtapa({ tipo: 'hoje' })} />
    default:
      return (
        <Hoje
          alunoId={aluno.id}
          versao={versao}
          resumos={resumos}
          hoje={hoje}
          onEstudar={iniciarEstudo}
          onVerTrilha={() => setEtapa({ tipo: 'trilha' })}
        />
      )
  }
}

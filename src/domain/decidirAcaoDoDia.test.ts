import { describe, expect, it } from 'vitest'
import { decidirAcaoDoDia } from './decidirAcaoDoDia'
import type { CapituloProgresso, Prova } from './tipos'

const HOJE = new Date(2026, 0, 10) // 10/01/2026

function capitulo(parcial: Partial<CapituloProgresso> = {}): CapituloProgresso {
  return { capituloId: 'hist.c6', progresso: 0.5, proximoCapituloId: 'hist.c7', ...parcial }
}

function prova(data: string, parcial: Partial<Prova> = {}): Prova {
  return {
    id: 'p1',
    materiaId: 'historia',
    materiaNome: 'História',
    titulo: 'Prova 3ª etapa',
    data,
    capitulos: ['hist.c6'],
    ...parcial,
  }
}

describe('decidirAcaoDoDia', () => {
  it('primeiro dia de uso: sem revisão, capítulo no início, sem prova -> continuar capítulo', () => {
    const acao = decidirAcaoDoDia(0, capitulo({ progresso: 0 }), [], HOJE)
    expect(acao).toEqual({ tipo: 'continuar', rotulo: 'Continuar capítulo', alvo: { capituloId: 'hist.c6' } })
  })

  it('com revisão vencida, ignora capítulo e manda estudar', () => {
    const acao = decidirAcaoDoDia(5, capitulo(), [], HOJE)
    expect(acao).toEqual({ tipo: 'estudar', rotulo: 'Estudar hoje', alvo: { quantidadeRevisoes: 5 } })
  })

  it('fila limpa e capítulo em andamento -> continuar capítulo', () => {
    const acao = decidirAcaoDoDia(0, capitulo({ progresso: 0.4 }), [], HOJE)
    expect(acao.tipo).toBe('continuar')
  })

  it('capítulo concluído e há próximo publicado -> convite para o próximo capítulo', () => {
    const acao = decidirAcaoDoDia(0, capitulo({ progresso: 1, proximoCapituloId: 'hist.c7' }), [], HOJE)
    expect(acao).toEqual({ tipo: 'proximoCapitulo', rotulo: 'Começar novo capítulo', alvo: { capituloId: 'hist.c7' } })
  })

  it('nada vencido, nada novo e sem próximo capítulo -> treino livre do capítulo atual', () => {
    const acao = decidirAcaoDoDia(0, capitulo({ progresso: 1, proximoCapituloId: null }), [], HOJE)
    expect(acao).toEqual({ tipo: 'continuar', rotulo: 'Treinar de novo', alvo: { capituloId: 'hist.c6' } })
  })

  it('prova em 3 dias tem prioridade sobre revisão vencida: mistura 70/30', () => {
    const acao = decidirAcaoDoDia(5, capitulo(), [prova('2026-01-13')], HOJE)
    expect(acao.tipo).toBe('prova')
    expect(acao.rotulo).toBe('Treinar para a prova de História')
  })

  it('prova amanhã entra no modo revisão de prova', () => {
    const acao = decidirAcaoDoDia(0, capitulo(), [prova('2026-01-11')], HOJE)
    expect(acao.tipo).toBe('revisaoProva')
    expect(acao.rotulo).toBe('Revisão de prova de História')
  })

  it('prova em 8 dias ainda não é relevante', () => {
    const acao = decidirAcaoDoDia(0, capitulo({ progresso: 0.2 }), [prova('2026-01-18')], HOJE)
    expect(acao.tipo).toBe('continuar')
  })

  it('prova no dia de hoje ou já passada some do fluxo', () => {
    const acaoHoje = decidirAcaoDoDia(0, capitulo({ progresso: 0.2 }), [prova('2026-01-10')], HOJE)
    const acaoPassada = decidirAcaoDoDia(0, capitulo({ progresso: 0.2 }), [prova('2026-01-05')], HOJE)
    expect(acaoHoje.tipo).toBe('continuar')
    expect(acaoPassada.tipo).toBe('continuar')
  })

  it('com duas provas próximas, escolhe a mais próxima', () => {
    const acao = decidirAcaoDoDia(
      0,
      capitulo(),
      [prova('2026-01-16', { id: 'p2', materiaNome: 'Geografia' }), prova('2026-01-12', { id: 'p1', materiaNome: 'História' })],
      HOJE,
    )
    expect(acao.tipo).toBe('prova')
    if (acao.tipo === 'prova') expect(acao.alvo.provaId).toBe('p1')
  })
})

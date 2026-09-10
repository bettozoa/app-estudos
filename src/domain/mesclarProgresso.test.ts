import { describe, expect, it } from 'vitest'
import { mesclarProgresso } from './mesclarProgresso'
import type { ProgressoQuestao } from './tipos'

function progresso(parcial: Partial<ProgressoQuestao> = {}): ProgressoQuestao {
  return {
    questaoId: 'hist.c6.m1.q01',
    caixa: 2,
    acertos: 1,
    erros: 0,
    proximaRevisao: '2026-01-11',
    ultimaResposta: '2026-01-10T10:00:00.000Z',
    ...parcial,
  }
}

describe('mesclarProgresso', () => {
  it('local mais recente vence os dados, mas a caixa fica com o menor valor dos dois', () => {
    const local = progresso({ caixa: 3, acertos: 2, ultimaResposta: '2026-01-10T12:00:00.000Z' })
    const remoto = progresso({ caixa: 1, acertos: 1, ultimaResposta: '2026-01-10T08:00:00.000Z' })

    const resultado = mesclarProgresso(local, remoto)

    expect(resultado.acertos).toBe(2) // dado do vencedor (local, mais recente)
    expect(resultado.caixa).toBe(1) // menor caixa entre os dois, mesmo o remoto não sendo o vencedor
  })

  it('remoto mais recente vence os dados', () => {
    const local = progresso({ caixa: 4, erros: 3, ultimaResposta: '2026-01-09T08:00:00.000Z' })
    const remoto = progresso({ caixa: 2, erros: 1, ultimaResposta: '2026-01-10T08:00:00.000Z' })

    const resultado = mesclarProgresso(local, remoto)

    expect(resultado.erros).toBe(1)
    expect(resultado.proximaRevisao).toBe(remoto.proximaRevisao)
    expect(resultado.caixa).toBe(2)
  })

  it('empate exato no horário: local vence por convenção', () => {
    const mesmoHorario = '2026-01-10T10:00:00.000Z'
    const local = progresso({ acertos: 9, ultimaResposta: mesmoHorario })
    const remoto = progresso({ acertos: 1, ultimaResposta: mesmoHorario })

    expect(mesclarProgresso(local, remoto).acertos).toBe(9)
  })

  it('registros idênticos resultam no mesmo progresso', () => {
    const p = progresso()
    expect(mesclarProgresso(p, p)).toEqual(p)
  })
})

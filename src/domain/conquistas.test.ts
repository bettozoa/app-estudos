import { describe, expect, it } from 'vitest'
import { avaliarConquistas, type ContextoConquistas } from './conquistas'

function contexto(parcial: Partial<ContextoConquistas> = {}): ContextoConquistas {
  return {
    moduloConcluidoAgora: false,
    capituloDominadoAgora: false,
    ofensivaAtual: 1,
    revisoesEmDiaTotal: 0,
    filaVazia: false,
    maiorSequenciaAcertosNaSessao: 0,
    materiasComProgresso: 1,
    conquistasJaObtidas: [],
    ...parcial,
  }
}

describe('avaliarConquistas', () => {
  it('sem nenhum gatilho, não retorna nada', () => {
    expect(avaliarConquistas(contexto())).toEqual([])
  })

  it('primeiro módulo concluído', () => {
    expect(avaliarConquistas(contexto({ moduloConcluidoAgora: true }))).toEqual(['primeiro_modulo'])
  })

  it('capítulo dominado', () => {
    expect(avaliarConquistas(contexto({ capituloDominadoAgora: true }))).toEqual(['capitulo_completo'])
  })

  it('ofensiva de 7 dias ou mais', () => {
    expect(avaliarConquistas(contexto({ ofensivaAtual: 7 }))).toEqual(['sete_dias'])
  })

  it('50 revisões em dia', () => {
    expect(avaliarConquistas(contexto({ revisoesEmDiaTotal: 50 }))).toEqual(['cinquenta_revisoes'])
  })

  it('fila de revisão zerada', () => {
    expect(avaliarConquistas(contexto({ filaVazia: true }))).toEqual(['fila_zerada'])
  })

  it('20 acertos seguidos na sessão', () => {
    expect(avaliarConquistas(contexto({ maiorSequenciaAcertosNaSessao: 20 }))).toEqual(['vinte_seguidas'])
  })

  it('explorador: 3 matérias com progresso', () => {
    expect(avaliarConquistas(contexto({ materiasComProgresso: 3 }))).toEqual(['explorador'])
  })

  it('não repete conquista já obtida', () => {
    expect(avaliarConquistas(contexto({ ofensivaAtual: 10, conquistasJaObtidas: ['sete_dias'] }))).toEqual([])
  })

  it('pode retornar várias conquistas novas ao mesmo tempo', () => {
    const resultado = avaliarConquistas(contexto({ moduloConcluidoAgora: true, filaVazia: true }))
    expect(resultado.sort()).toEqual(['fila_zerada', 'primeiro_modulo'])
  })
})

import { describe, expect, it } from 'vitest'
import { montarSessao } from './sessao'
import type { Questao } from './tipos'

function questoesFalsas(prefixo: string, quantidade: number): Questao[] {
  return Array.from({ length: quantidade }, (_, i) => ({
    id: `${prefixo}${i + 1}`,
    moduloId: 'mod.1',
    tipo: 'mc',
    enunciado: '...',
    apoio: null,
    alternativas: ['a', 'b', 'c', 'd'],
    correta: 0,
    pares: null,
    explicacao: '...',
    fonte: 'L3 p.1',
    dificuldade: 2,
    ativo: true,
  }))
}

describe('montarSessao', () => {
  it('fila vazia dos dois lados retorna sessão vazia', () => {
    expect(montarSessao([], [])).toEqual([])
  })

  it('sem nada vencido, preenche 100% com questões novas até o alvo', () => {
    const novas = questoesFalsas('n', 30)
    const sessao = montarSessao([], novas, { tamanhoAlvo: 20 })
    expect(sessao).toHaveLength(20)
    expect(sessao.every((q) => q.id.startsWith('n'))).toBe(true)
  })

  it('sem questão nova, completa a sessão só com revisões vencidas', () => {
    const revisoes = questoesFalsas('r', 30)
    const sessao = montarSessao(revisoes, [], { tamanhoAlvo: 20 })
    expect(sessao).toHaveLength(20)
    expect(sessao.every((q) => q.id.startsWith('r'))).toBe(true)
  })

  it('dia comum mistura até 60% de revisão com o resto de novas', () => {
    const revisoes = questoesFalsas('r', 30)
    const novas = questoesFalsas('n', 30)
    const sessao = montarSessao(revisoes, novas, { tamanhoAlvo: 20, proporcaoRevisao: 0.6 })
    const totalRevisoes = sessao.filter((q) => q.id.startsWith('r')).length
    const totalNovas = sessao.filter((q) => q.id.startsWith('n')).length
    expect(sessao).toHaveLength(20)
    expect(totalRevisoes).toBe(12)
    expect(totalNovas).toBe(8)
  })

  it('poucas revisões e poucas novas: retorna só o que existe, sem inventar questão', () => {
    const revisoes = questoesFalsas('r', 2)
    const novas = questoesFalsas('n', 3)
    const sessao = montarSessao(revisoes, novas, { tamanhoAlvo: 20 })
    expect(sessao).toHaveLength(5)
  })
})

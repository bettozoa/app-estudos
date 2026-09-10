import { describe, expect, it } from 'vitest'
import { atualizarOfensiva, type EstadoOfensiva } from './ofensiva'

function estado(parcial: Partial<EstadoOfensiva> = {}): EstadoOfensiva {
  return { ofensiva: 3, melhorOfensiva: 5, escudos: 0, ultimoDiaAtivo: '2026-01-09', ...parcial }
}

describe('atualizarOfensiva', () => {
  it('primeiro dia de uso começa a ofensiva em 1', () => {
    const r = atualizarOfensiva(estado({ ofensiva: 0, melhorOfensiva: 0, ultimoDiaAtivo: null }), '2026-01-10')
    expect(r.ofensiva).toBe(1)
    expect(r.melhorOfensiva).toBe(1)
  })

  it('mesmo dia é idempotente (chamar de novo não soma)', () => {
    const r = atualizarOfensiva(estado({ ultimoDiaAtivo: '2026-01-10' }), '2026-01-10')
    expect(r).toEqual(estado({ ultimoDiaAtivo: '2026-01-10' }))
  })

  it('dia seguinte soma 1 à ofensiva', () => {
    const r = atualizarOfensiva(estado({ ultimoDiaAtivo: '2026-01-09' }), '2026-01-10')
    expect(r.ofensiva).toBe(4)
  })

  it('pulou 1 dia com escudo disponível: perdoa e gasta o escudo', () => {
    const r = atualizarOfensiva(estado({ ultimoDiaAtivo: '2026-01-08', escudos: 1 }), '2026-01-10')
    expect(r.ofensiva).toBe(4)
    expect(r.escudos).toBe(0)
  })

  it('pulou 1 dia sem escudo: quebra a sequência', () => {
    const r = atualizarOfensiva(estado({ ultimoDiaAtivo: '2026-01-08', escudos: 0 }), '2026-01-10')
    expect(r.ofensiva).toBe(1)
  })

  it('pulou 2+ dias mesmo com escudo: quebra a sequência (escudo só perdoa 1 dia)', () => {
    const r = atualizarOfensiva(estado({ ultimoDiaAtivo: '2026-01-05', escudos: 1 }), '2026-01-10')
    expect(r.ofensiva).toBe(1)
    expect(r.escudos).toBe(1) // não gastou, já que não perdoou nada
  })

  it('ganha 1 escudo ao completar um múltiplo de 7 dias', () => {
    const r = atualizarOfensiva(estado({ ofensiva: 6, escudos: 0, ultimoDiaAtivo: '2026-01-09' }), '2026-01-10')
    expect(r.ofensiva).toBe(7)
    expect(r.escudos).toBe(1)
  })

  it('não ganha escudo além do máximo de 2', () => {
    const r = atualizarOfensiva(estado({ ofensiva: 6, escudos: 2, ultimoDiaAtivo: '2026-01-09' }), '2026-01-10')
    expect(r.ofensiva).toBe(7)
    expect(r.escudos).toBe(2)
  })

  it('melhorOfensiva nunca diminui', () => {
    const r = atualizarOfensiva(estado({ ofensiva: 8, melhorOfensiva: 8, ultimoDiaAtivo: '2026-01-08', escudos: 0 }), '2026-01-10')
    expect(r.ofensiva).toBe(1)
    expect(r.melhorOfensiva).toBe(8)
  })
})

import { describe, expect, it } from 'vitest'
import { calcularMoedasGanhas, calcularXP } from './xp'

describe('calcularXP', () => {
  it('acerto de primeira vale 10', () => {
    expect(calcularXP('primeiraVez')).toBe(10)
  })
  it('acerto em revisão vale 6', () => {
    expect(calcularXP('revisao')).toBe(6)
  })
  it('acerto depois de errar vale 3', () => {
    expect(calcularXP('aposErro')).toBe(3)
  })
  it('erro não tira nem dá ponto', () => {
    expect(calcularXP('erro')).toBe(0)
  })
})

describe('calcularMoedasGanhas', () => {
  it('cruzar um múltiplo de 20 dá 1 moeda', () => {
    expect(calcularMoedasGanhas(15, 25)).toBe(1)
  })
  it('não cruzar múltiplo de 20 não dá moeda', () => {
    expect(calcularMoedasGanhas(21, 24)).toBe(0)
  })
  it('ganho grande cruzando várias faixas de 20 dá várias moedas', () => {
    expect(calcularMoedasGanhas(0, 65)).toBe(3)
  })
  it('não perde moeda por arredondamento de ganhos pequenos e sucessivos', () => {
    // 0 -> 6 -> 12 -> 18 -> 24 (quatro respostas de 6 XP): a 4ª cruza de 18 pra 24, ganha 1 moeda
    let xp = 0
    let moedas = 0
    for (const ganho of [6, 6, 6, 6]) {
      const novoXp = xp + ganho
      moedas += calcularMoedasGanhas(xp, novoXp)
      xp = novoXp
    }
    expect(moedas).toBe(1)
  })
})

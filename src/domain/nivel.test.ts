import { describe, expect, it } from 'vitest'
import { calcularNivel, xpNecessarioParaNivel } from './nivel'

describe('xpNecessarioParaNivel', () => {
  it('segue a curva 100 * n^1.3', () => {
    expect(xpNecessarioParaNivel(1)).toBe(100)
    expect(xpNecessarioParaNivel(2)).toBe(Math.round(100 * 2 ** 1.3))
  })
})

describe('calcularNivel', () => {
  it('xp zero fica no nível 1', () => {
    const info = calcularNivel(0)
    expect(info.nivel).toBe(1)
    expect(info.xpNoNivelAtual).toBe(0)
  })

  it('xp exatamente no limite do nível 1 sobe pro nível 2', () => {
    const custoNivel1 = xpNecessarioParaNivel(1)
    const info = calcularNivel(custoNivel1)
    expect(info.nivel).toBe(2)
    expect(info.xpNoNivelAtual).toBe(0)
  })

  it('xp negativo (não deveria acontecer, mas não quebra) trata como zero', () => {
    expect(calcularNivel(-10).nivel).toBe(1)
  })

  it('xp alto atravessa vários níveis corretamente', () => {
    const info = calcularNivel(1000)
    let acumulado = 0
    let nivel = 1
    while (acumulado + xpNecessarioParaNivel(nivel) <= 1000) {
      acumulado += xpNecessarioParaNivel(nivel)
      nivel++
    }
    expect(info.nivel).toBe(nivel)
    expect(info.xpNoNivelAtual).toBe(1000 - acumulado)
  })
})

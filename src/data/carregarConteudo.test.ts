import { describe, expect, it } from 'vitest'
import { carregarConteudo } from './carregarConteudo'

describe('carregarConteudo', () => {
  it('lê os capítulos e materias de conteudo/ sem perder nem inventar questão', () => {
    const { materias, capitulos, modulos, questoes } = carregarConteudo()

    expect(Object.keys(materias).sort()).toEqual(['geografia', 'historia'])
    expect(capitulos.map((c) => c.id).sort()).toEqual(['geo.c6', 'geo.c7', 'hist.c6'])
    expect(modulos).toHaveLength(6 + 5 + 2)
    expect(questoes).toHaveLength(137)

    const idsUnicos = new Set(questoes.map((q) => q.id))
    expect(idsUnicos.size).toBe(questoes.length)
    expect(questoes.every((q) => q.fonte && q.explicacao)).toBe(true)
  })
})

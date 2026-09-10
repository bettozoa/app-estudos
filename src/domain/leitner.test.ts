import { describe, expect, it } from 'vitest'
import { agendarProxima } from './leitner'

const HOJE = new Date(2026, 0, 10)

describe('agendarProxima', () => {
  it('acerto na caixa 1 sobe para a caixa 2 e agenda para amanhã', () => {
    const r = agendarProxima(1, true, HOJE)
    expect(r.caixa).toBe(2)
    expect(r.proximaRevisao).toEqual(new Date(2026, 0, 11))
  })

  it('erro em qualquer caixa volta para a caixa 1 e agenda para hoje', () => {
    const r = agendarProxima(4, false, HOJE)
    expect(r.caixa).toBe(1)
    expect(r.proximaRevisao).toEqual(HOJE)
  })

  it('acerto na caixa 5 (máxima) permanece na caixa 5 e agenda 16 dias', () => {
    const r = agendarProxima(5, true, HOJE)
    expect(r.caixa).toBe(5)
    expect(r.proximaRevisao).toEqual(new Date(2026, 0, 26))
  })

  it('cada caixa usa o intervalo correto da tabela Leitner', () => {
    expect(agendarProxima(1, true, HOJE).proximaRevisao).toEqual(new Date(2026, 0, 11)) // caixa 2: 1 dia
    expect(agendarProxima(2, true, HOJE).proximaRevisao).toEqual(new Date(2026, 0, 13)) // caixa 3: 3 dias
    expect(agendarProxima(3, true, HOJE).proximaRevisao).toEqual(new Date(2026, 0, 17)) // caixa 4: 7 dias
    expect(agendarProxima(4, true, HOJE).proximaRevisao).toEqual(new Date(2026, 0, 26)) // caixa 5: 16 dias
  })

  it('caixa fora do intervalo válido é normalizada antes de calcular', () => {
    expect(agendarProxima(0, true, HOJE).caixa).toBe(2) // tratada como caixa 1
    expect(agendarProxima(9, true, HOJE).caixa).toBe(5) // tratada como caixa 5
  })
})

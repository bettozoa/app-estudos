export interface InfoNivel {
  nivel: number
  xpNoNivelAtual: number
  xpNecessarioProximoNivel: number
}

// Curva suave da seção 7: xp_necessario(n) = 100 * n^1.3
export function xpNecessarioParaNivel(nivel: number): number {
  return Math.round(100 * nivel ** 1.3)
}

// Soma o custo de cada nível até o XP total não alcançar mais o próximo.
export function calcularNivel(xpTotal: number): InfoNivel {
  let nivel = 1
  let xpRestante = Math.max(xpTotal, 0)
  let custoProximo = xpNecessarioParaNivel(nivel)

  while (xpRestante >= custoProximo) {
    xpRestante -= custoProximo
    nivel++
    custoProximo = xpNecessarioParaNivel(nivel)
  }

  return { nivel, xpNoNivelAtual: xpRestante, xpNecessarioProximoNivel: custoProximo }
}

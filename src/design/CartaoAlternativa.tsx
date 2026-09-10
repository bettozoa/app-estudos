import type { ButtonHTMLAttributes } from 'react'
import { cores, raios } from './tokens'

interface CartaoAlternativaProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  estado?: 'neutro' | 'certa' | 'errada'
}

// Card de toque para uma alternativa de resposta: mínimo 56px de altura, área toda clicável,
// sem letrinhas A/B/C/D pequenas (seção 4 do PLANO_VISUAL.md).
export function CartaoAlternativa({ estado = 'neutro', className = '', style, children, ...props }: CartaoAlternativaProps) {
  const cor = { neutro: cores.contorno, certa: cores.verde, errada: cores.laranja }[estado]
  const fundo = { neutro: cores.superficie, certa: '#DFF3E7', errada: cores.erroFundo }[estado]

  return (
    <button
      {...props}
      disabled={props.disabled}
      className={`block min-h-[56px] w-full px-4 py-3 text-left text-[18px] font-bold disabled:cursor-default ${className}`}
      style={{
        backgroundColor: fundo,
        border: `3px solid ${cor}`,
        borderRadius: raios.card,
        color: cores.contorno,
        ...style,
      }}
    >
      {children}
    </button>
  )
}

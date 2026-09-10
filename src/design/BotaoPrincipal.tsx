import { useState, type ButtonHTMLAttributes } from 'react'
import { cores, raios, sombras } from './tokens'

interface BotaoPrincipalProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: 'primaria' | 'secundaria'
}

// Botão "de tecla": base 4px mais escura que afunda ao toque (seção 4 do PLANO_VISUAL.md).
export function BotaoPrincipal({ variante = 'primaria', className = '', style, children, ...props }: BotaoPrincipalProps) {
  const [pressionado, setPressionado] = useState(false)
  const primaria = variante === 'primaria'
  const corFundo = primaria ? cores.laranja : cores.superficie
  const corTexto = primaria ? cores.superficie : cores.contorno
  const corBase = primaria ? sombras.laranja : sombras.branca

  function soltar() {
    setPressionado(false)
  }

  return (
    <button
      {...props}
      onPointerDown={(e) => {
        setPressionado(true)
        props.onPointerDown?.(e)
      }}
      onPointerUp={(e) => {
        soltar()
        props.onPointerUp?.(e)
      }}
      onPointerLeave={(e) => {
        soltar()
        props.onPointerLeave?.(e)
      }}
      className={`min-h-[56px] w-full px-6 text-[19px] font-bold transition-transform duration-75 disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
      style={{
        color: corTexto,
        backgroundColor: corFundo,
        border: `3px solid ${cores.contorno}`,
        borderRadius: raios.botao,
        boxShadow: props.disabled || pressionado ? 'none' : `0 4px 0 ${corBase}`,
        transform: !props.disabled && pressionado ? 'translateY(4px)' : 'translateY(0)',
        ...style,
      }}
    >
      {children}
    </button>
  )
}

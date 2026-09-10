import type { HTMLAttributes } from 'react'
import { cores, raios } from './tokens'

export function Card({ className = '', style, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={`p-4 sm:p-5 ${className}`}
      style={{
        backgroundColor: cores.superficie,
        border: `3px solid ${cores.contorno}`,
        borderRadius: raios.card,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

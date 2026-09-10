import { useEffect, useState } from 'react'
import { cores } from './tokens'

const CORES_CONFETE = [cores.laranja, cores.amarelo, cores.verde, cores.roxo, cores.azulCeu, cores.rosa]

function prefereMovimentoReduzido(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Confete simples em CSS, só nos momentos de conquista/nível (seção 4 do PLANO_VISUAL.md:
// "se tudo brilha, nada brilha"). Sem lib externa — o app precisa abrir offline. Desliga
// sozinho com prefers-reduced-motion.
export function Confete() {
  const [visivel, setVisivel] = useState(true)

  useEffect(() => {
    if (prefereMovimentoReduzido()) {
      setVisivel(false)
      return
    }
    const tempo = setTimeout(() => setVisivel(false), 1200)
    return () => clearTimeout(tempo)
  }, [])

  if (!visivel) return null

  const pedacos = Array.from({ length: 24 }, (_, i) => i)

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {pedacos.map((i) => {
        const esquerda = Math.random() * 100
        const atraso = Math.random() * 0.3
        const duracao = 0.9 + Math.random() * 0.4
        const cor = CORES_CONFETE[i % CORES_CONFETE.length]
        return (
          <span
            key={i}
            className="absolute top-[-10px] h-2.5 w-2.5 rounded-sm"
            style={{
              left: `${esquerda}%`,
              backgroundColor: cor,
              animation: `confete-cair ${duracao}s ease-in ${atraso}s forwards`,
            }}
          />
        )
      })}
      <style>{`
        @keyframes confete-cair {
          from { transform: translateY(0) rotate(0deg); opacity: 1; }
          to { transform: translateY(110vh) rotate(340deg); opacity: 0.9; }
        }
      `}</style>
    </div>
  )
}

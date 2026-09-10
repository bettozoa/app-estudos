import { useEffect, useMemo, useState } from 'react'
import { BarraProgresso, BotaoPrincipal, Card, CartaoAlternativa, cores } from '../design'
import { useSessaoStore } from '../estado/sessaoStore'
import type { Questao } from '../domain/tipos'
import { embaralhar } from '../app/utilAleatorio'

interface SessaoProps {
  onFinalizar: () => void
}

export function Sessao({ onFinalizar }: SessaoProps) {
  const fila = useSessaoStore((s) => s.fila)
  const posicao = useSessaoStore((s) => s.posicao)
  const feedback = useSessaoStore((s) => s.feedback)
  const responder = useSessaoStore((s) => s.responder)
  const avancar = useSessaoStore((s) => s.avancar)
  const questao = fila[posicao]

  useEffect(() => {
    if (fila.length > 0 && !questao) onFinalizar()
  }, [fila.length, questao, onFinalizar])

  if (!questao) return null

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 p-5" style={{ backgroundColor: cores.fundo, minHeight: '100vh' }}>
      <BarraProgresso progresso={posicao / fila.length} />

      <Card className="flex flex-col gap-3">
        {questao.apoio && (
          <p className="rounded-lg p-3 text-sm" style={{ backgroundColor: '#EAF7FA', color: cores.contorno }}>
            {questao.apoio}
          </p>
        )}
        <p className="text-lg font-bold" style={{ color: cores.contorno }}>
          {questao.enunciado}
        </p>

        {questao.tipo === 'assoc' ? (
          <TelaAssoc questao={questao} feedback={feedback} onResponder={responder} />
        ) : (
          <TelaEscolha questao={questao} feedback={feedback} onResponder={responder} />
        )}

        {feedback && (
          <div className="flex flex-col gap-2 rounded-lg p-3" style={{ backgroundColor: feedback.acertou ? '#DFF3E7' : cores.erroFundo }}>
            <p className="font-extrabold">{feedback.acertou ? 'Muito bem! ✅' : 'Vamos tentar de novo! 🔁'}</p>
            <p className="text-sm">{questao.explicacao}</p>
            <p className="text-xs opacity-70">Fonte: {questao.fonte}</p>
          </div>
        )}
      </Card>

      {feedback && <BotaoPrincipal onClick={avancar}>Próxima ➜</BotaoPrincipal>}
    </main>
  )
}

interface EscolhaProps {
  questao: Questao
  feedback: { acertou: boolean } | null
  onResponder: (acertou: boolean) => void
}

function TelaEscolha({ questao, feedback, onResponder }: EscolhaProps) {
  const [escolha, setEscolha] = useState<number | null>(null)

  useEffect(() => setEscolha(null), [questao.id])

  function escolher(indice: number) {
    if (feedback) return
    setEscolha(indice)
    onResponder(indice === questao.correta)
  }

  return (
    <div className="flex flex-col gap-2">
      {questao.alternativas?.map((alternativa, indice) => {
        let estado: 'neutro' | 'certa' | 'errada' = 'neutro'
        if (feedback) {
          if (indice === questao.correta) estado = 'certa'
          else if (indice === escolha) estado = 'errada'
        }
        return (
          <CartaoAlternativa key={indice} estado={estado} disabled={!!feedback} onClick={() => escolher(indice)}>
            {alternativa}
          </CartaoAlternativa>
        )
      })}
    </div>
  )
}

function TelaAssoc({ questao, feedback, onResponder }: EscolhaProps) {
  const pares = questao.pares ?? []
  const opcoes = useMemo(() => embaralhar(pares.map((p) => p[1])), [questao.id])
  const [selecionados, setSelecionados] = useState<string[]>(() => pares.map(() => ''))

  useEffect(() => setSelecionados(pares.map(() => '')), [questao.id])

  function conferir() {
    const acertou = pares.every((par, i) => selecionados[i] === par[1])
    onResponder(acertou)
  }

  return (
    <div className="flex flex-col gap-3">
      {pares.map((par, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="flex-1 text-sm font-bold">{par[0]}</span>
          <select
            disabled={!!feedback}
            value={selecionados[i]}
            onChange={(e) => {
              const copia = [...selecionados]
              copia[i] = e.target.value
              setSelecionados(copia)
            }}
            className="flex-1 rounded-lg p-2 text-sm"
            style={{ border: `3px solid ${cores.contorno}` }}
          >
            <option value="">escolha...</option>
            {opcoes.map((op) => (
              <option key={op} value={op}>
                {op}
              </option>
            ))}
          </select>
        </div>
      ))}

      {!feedback && (
        <BotaoPrincipal disabled={selecionados.some((s) => !s)} onClick={conferir}>
          Conferir
        </BotaoPrincipal>
      )}

      {feedback && !feedback.acertou && (
        <ul className="list-disc pl-5 text-sm">
          {pares.map((par, i) => (
            <li key={i}>
              {par[0]} ➜ {par[1]}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

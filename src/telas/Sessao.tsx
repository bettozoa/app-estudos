import { useEffect, useMemo, useState } from 'react'
import { BarraProgresso, BotaoPrincipal, Card, CartaoAlternativa, cores, Mascote } from '../design'
import { useSessaoStore } from '../estado/sessaoStore'
import { useSkinStore } from '../estado/skinStore'
import type { Questao } from '../domain/tipos'
import { embaralhar } from '../app/utilAleatorio'
import { alternarSom, estaSomLigado, tocarSomAcerto, tocarSomErro } from '../app/som'

interface SessaoProps {
  onFinalizar: () => void
  onSair: () => void
}

const FRASES_ACERTO = ['Muito bem! ✅', 'Isso aí! 🎯', 'Mandou bem! ⭐', 'Acertou! 👏']
const FRASES_ERRO = ['Vamos tentar de novo! 🔁', 'Quase! Olha só... 🔍', 'Essa foi difícil, hein? 🤔']

export function Sessao({ onFinalizar, onSair }: SessaoProps) {
  const fila = useSessaoStore((s) => s.fila)
  const posicao = useSessaoStore((s) => s.posicao)
  const feedback = useSessaoStore((s) => s.feedback)
  const responder = useSessaoStore((s) => s.responder)
  const avancar = useSessaoStore((s) => s.avancar)
  const questao = fila[posicao]
  const [somLigado, setSomLigado] = useState(estaSomLigado)
  const skinAtual = useSkinStore((s) => s.skinAtual)

  useEffect(() => {
    if (fila.length > 0 && !questao) onFinalizar()
  }, [fila.length, questao, onFinalizar])

  useEffect(() => {
    if (!feedback) return
    if (feedback.acertou) tocarSomAcerto()
    else tocarSomErro()
  }, [feedback])

  if (!questao) return null

  const fraseFeedback = feedback
    ? (feedback.acertou ? FRASES_ACERTO : FRASES_ERRO)[posicao % (feedback.acertou ? FRASES_ACERTO.length : FRASES_ERRO.length)]
    : ''

  return (
    <main className="tela-com-fade mx-auto flex max-w-md flex-col gap-4 p-5" style={{ backgroundColor: cores.fundo, minHeight: '100vh' }}>
      <div className="flex items-center gap-2">
        <button type="button" aria-label="Sair da sessão" onClick={onSair} className="text-sm font-bold" style={{ color: cores.contorno }}>
          ← Sair
        </button>
        <div className="flex-1">
          <BarraProgresso progresso={posicao / fila.length} />
        </div>
        <button
          type="button"
          aria-label={somLigado ? 'Desligar som' : 'Ligar som'}
          onClick={() => setSomLigado(alternarSom())}
          className="text-xl"
        >
          {somLigado ? '🔊' : '🔇'}
        </button>
      </div>

      <div className="flex justify-center">
        <Mascote estado={!feedback ? 'pensando' : feedback.acertou ? 'comemorando' : 'encorajando'} tamanho={72} skinId={skinAtual} />
      </div>

      <Card className="flex flex-col gap-3">
        {questao.apoio && (
          <p className="rounded-lg p-3 text-base" style={{ backgroundColor: '#EAF7FA', color: cores.contorno }}>
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
          <div className="animar-entrada flex flex-col gap-2 rounded-lg p-3" style={{ backgroundColor: feedback.acertou ? '#DFF3E7' : cores.erroFundo }}>
            <p className="font-extrabold">{fraseFeedback}</p>
            <p className="text-base">{questao.explicacao}</p>
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

  // Embaralha a ORDEM de exibição (guardando o índice original de cada alternativa) — sem
  // isso, a resposta certa aparece sempre na mesma posição do arquivo de conteúdo (quase
  // sempre a primeira, já que é assim que o material de origem foi escrito).
  const ordemExibicao = useMemo(() => embaralhar((questao.alternativas ?? []).map((_, i) => i)), [questao.id])

  useEffect(() => setEscolha(null), [questao.id])

  function escolher(indiceOriginal: number) {
    if (feedback) return
    setEscolha(indiceOriginal)
    onResponder(indiceOriginal === questao.correta)
  }

  return (
    <div className="flex flex-col gap-2">
      {ordemExibicao.map((indiceOriginal) => {
        let estado: 'neutro' | 'certa' | 'errada' = 'neutro'
        if (feedback) {
          if (indiceOriginal === questao.correta) estado = 'certa'
          else if (indiceOriginal === escolha) estado = 'errada'
        }
        return (
          <CartaoAlternativa
            key={indiceOriginal}
            estado={estado}
            foiEscolhida={indiceOriginal === escolha}
            disabled={!!feedback}
            onClick={() => escolher(indiceOriginal)}
          >
            {questao.alternativas![indiceOriginal]}
          </CartaoAlternativa>
        )
      })}
    </div>
  )
}

function TelaAssoc({ questao, feedback, onResponder }: EscolhaProps) {
  const pares = questao.pares ?? []
  // Cada opção carrega o índice do par de onde veio o texto — precisa ser por posição, não
  // por texto: em questões que classificam em categorias (ex.: "Planejada"/"Espontânea"), o
  // mesmo texto aparece mais de uma vez, e as duas ocorrências têm que poder ser escolhidas
  // em campos diferentes.
  const opcoes = useMemo(() => embaralhar(pares.map((p, indice) => ({ id: indice, texto: p[1] }))), [questao.id])
  const [selecionados, setSelecionados] = useState<(number | null)[]>(() => pares.map(() => null))

  useEffect(() => setSelecionados(pares.map(() => null)), [questao.id])

  function textoEscolhido(i: number): string | null {
    const id = selecionados[i]
    return id === null ? null : (opcoes.find((o) => o.id === id)?.texto ?? null)
  }

  function conferir() {
    const acertou = pares.every((par, i) => textoEscolhido(i) === par[1])
    onResponder(acertou)
  }

  return (
    <div className="flex flex-col gap-3">
      {pares.map((par, i) => {
        const idUsadoEmOutroCampo = (id: number) => selecionados.some((s, j) => j !== i && s === id)
        const acertouLinha = textoEscolhido(i) === par[1]
        const estadoLinha = feedback ? (acertouLinha ? 'certa' : 'errada') : 'neutro'
        const corLinha = { neutro: cores.contorno, certa: cores.verde, errada: cores.laranja }[estadoLinha]
        return (
          <div key={i} className="flex flex-col gap-1">
            <span className="text-base font-bold break-words">{par[0]}</span>
            <select
              disabled={!!feedback}
              value={selecionados[i] ?? ''}
              onChange={(e) => {
                const copia = [...selecionados]
                copia[i] = e.target.value === '' ? null : Number(e.target.value)
                setSelecionados(copia)
              }}
              className="w-full min-w-0 rounded-lg p-3 text-base"
              style={{ border: `3px solid ${corLinha}`, backgroundColor: feedback ? (estadoLinha === 'certa' ? '#DFF3E7' : cores.erroFundo) : cores.superficie }}
            >
              <option value="">escolha...</option>
              {opcoes.map((op) => (
                <option key={op.id} value={op.id} disabled={idUsadoEmOutroCampo(op.id)}>
                  {op.texto}
                  {idUsadoEmOutroCampo(op.id) ? ' (já usada)' : ''}
                </option>
              ))}
            </select>
          </div>
        )
      })}

      {!feedback && (
        <BotaoPrincipal disabled={selecionados.some((s) => s === null)} onClick={conferir}>
          Conferir
        </BotaoPrincipal>
      )}

      {feedback && !feedback.acertou && pares.some((par, i) => textoEscolhido(i) !== par[1]) && (
        <ul className="list-disc pl-5 text-sm">
          {pares.map((par, i) =>
            textoEscolhido(i) !== par[1] ? (
              <li key={i}>
                {par[0]} ➜ {par[1]}
              </li>
            ) : null,
          )}
        </ul>
      )}
    </div>
  )
}

import { useState } from 'react'
import { atualizarAvatar, type Aluno } from '../data/alunos'
import { gastarMoedas } from '../data/stats'
import { SKINS, SKIN_PADRAO } from '../app/skins'
import { useStats } from '../app/useStats'
import { useSkinStore } from '../estado/skinStore'
import { BotaoPrincipal, Card, cores, IconeMoeda, Mascote, Pilula } from '../design'

interface LojaProps {
  aluno: Aluno
  versao: number
  onVoltar: () => void
  onAtualizarAluno: (aluno: Aluno) => void
}

export function Loja({ aluno, versao, onVoltar, onAtualizarAluno }: LojaProps) {
  const stats = useStats(aluno.id, versao)
  const setSkin = useSkinStore((s) => s.setSkin)
  const [processando, setProcessando] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  const skinsCompradas = aluno.avatar?.skinsCompradas ?? [SKIN_PADRAO]
  const skinEquipada = aluno.avatar?.skinGato ?? SKIN_PADRAO

  async function comprar(skinId: string, preco: number) {
    setErro(null)
    setProcessando(skinId)
    try {
      const conseguiu = await gastarMoedas(aluno.id, preco)
      if (!conseguiu) {
        setErro('Moedas insuficientes ainda — continue estudando!')
        return
      }
      const novoAvatar = { skinGato: skinId, skinsCompradas: [...skinsCompradas, skinId] }
      await atualizarAvatar(aluno.id, novoAvatar)
      setSkin(skinId)
      onAtualizarAluno({ ...aluno, avatar: novoAvatar })
    } catch {
      setErro('Não deu pra comprar agora — tenta de novo em instantes.')
    } finally {
      setProcessando(null)
    }
  }

  async function equipar(skinId: string) {
    setErro(null)
    setProcessando(skinId)
    try {
      const novoAvatar = { skinGato: skinId, skinsCompradas }
      await atualizarAvatar(aluno.id, novoAvatar)
      setSkin(skinId)
      onAtualizarAluno({ ...aluno, avatar: novoAvatar })
    } catch {
      setErro('Não deu pra equipar agora — tenta de novo em instantes.')
    } finally {
      setProcessando(null)
    }
  }

  return (
    <main
      className="tela-com-fade mx-auto flex max-w-md flex-col gap-4 p-5"
      style={{ backgroundColor: cores.fundo, minHeight: '100vh', color: cores.contorno }}
    >
      <div className="flex items-center gap-2">
        <button type="button" aria-label="Voltar" onClick={onVoltar} className="text-lg font-bold">
          ←
        </button>
        <h1 className="text-xl font-extrabold">Loja</h1>
      </div>

      {stats && (
        <div className="flex justify-center">
          <Pilula icone={<IconeMoeda tamanho={16} />}>{stats.moedas}</Pilula>
        </div>
      )}

      {erro && (
        <p className="text-center text-sm font-bold" style={{ color: cores.laranja }}>
          {erro}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        {SKINS.map((skin) => {
          const comprada = skinsCompradas.includes(skin.id)
          const equipada = skinEquipada === skin.id
          const semSaldo = !!stats && stats.moedas < skin.preco

          return (
            <Card key={skin.id} className="flex flex-col items-center gap-2">
              <Mascote estado="acenando" tamanho={64} skinId={skin.id} />
              <p className="text-center text-sm font-bold">{skin.nome}</p>

              {equipada ? (
                <span className="text-xs font-bold" style={{ color: cores.verde }}>
                  Equipado ✅
                </span>
              ) : comprada ? (
                <BotaoPrincipal variante="secundaria" disabled={processando === skin.id} onClick={() => equipar(skin.id)}>
                  Equipar
                </BotaoPrincipal>
              ) : (
                <BotaoPrincipal disabled={semSaldo || processando === skin.id} onClick={() => comprar(skin.id, skin.preco)}>
                  🪙 {skin.preco}
                </BotaoPrincipal>
              )}
            </Card>
          )
        })}
      </div>
    </main>
  )
}

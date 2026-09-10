import { calcularNivel } from '../domain/nivel'
import { decidirAcaoDoDia } from '../domain/decidirAcaoDoDia'
import { BarraProgresso, BotaoPrincipal, Card, cores, IconeEscudo, IconeEstrela, IconeFogo, IconeMoeda, Mascote, Pilula } from '../design'
import { useStats } from '../app/useStats'
import { useSkinStore } from '../estado/skinStore'
import type { ResumoMateria } from '../app/resumoMateria'

interface HojeProps {
  alunoId: string
  versao: number
  resumos: ResumoMateria[]
  hoje: Date
  onEstudar: (materiaId: string) => void
  onVerTrilha: () => void
  onVerLoja: () => void
}

export function Hoje({ alunoId, versao, resumos, hoje, onEstudar, onVerTrilha, onVerLoja }: HojeProps) {
  const stats = useStats(alunoId, versao)
  const info = stats ? calcularNivel(stats.xp) : null
  const skinAtual = useSkinStore((s) => s.skinAtual)

  return (
    <main className="tela-com-fade mx-auto flex max-w-md flex-col gap-5 p-5" style={{ backgroundColor: cores.fundo, minHeight: '100vh' }}>
      <div className="flex flex-col items-center gap-2 pt-4">
        <Mascote estado="acenando" skinId={skinAtual} />
        <p className="text-xl font-extrabold" style={{ color: cores.contorno }}>
          Vamos estudar?
        </p>

        {stats && info && (
          <div className="flex flex-wrap justify-center gap-2">
            <Pilula cor={cores.amarelo} icone={<IconeEstrela tamanho={16} />}>
              Nível {info.nivel}
            </Pilula>
            <Pilula cor={cores.laranja} icone={<IconeFogo tamanho={16} />}>
              {stats.ofensiva} dia(s)
            </Pilula>
            {stats.escudos > 0 && (
              <Pilula cor={cores.azulCeu} icone={<IconeEscudo tamanho={16} cor="#fff" />}>
                {stats.escudos}
              </Pilula>
            )}
            <Pilula icone={<IconeMoeda tamanho={16} />}>{stats.moedas}</Pilula>
          </div>
        )}
      </div>

      {resumos.map((resumo) => (
        <CartaoMateria key={resumo.materia.id} resumo={resumo} hoje={hoje} onEstudar={() => onEstudar(resumo.materia.id)} />
      ))}

      <div className="flex gap-3">
        <BotaoPrincipal variante="secundaria" onClick={onVerTrilha}>
          Ver trilha
        </BotaoPrincipal>
        <BotaoPrincipal variante="secundaria" onClick={onVerLoja}>
          Loja
        </BotaoPrincipal>
      </div>
    </main>
  )
}

function CartaoMateria({ resumo, hoje, onEstudar }: { resumo: ResumoMateria; hoje: Date; onEstudar: () => void }) {
  const acao = decidirAcaoDoDia(
    resumo.revisoesVencidas.length,
    resumo.capituloAtual
      ? { capituloId: resumo.capituloAtual.id, progresso: resumo.progressoCapituloAtual, proximoCapituloId: null }
      : { capituloId: '', progresso: 1, proximoCapituloId: null },
    [],
    hoje,
  )

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-lg font-extrabold" style={{ color: resumo.materia.cor }}>
          {resumo.materia.emoji} {resumo.materia.nome}
        </span>
        {resumo.revisoesVencidas.length > 0 && (
          <span className="text-sm font-bold" style={{ color: cores.laranja }}>
            🔁 {resumo.revisoesVencidas.length} revisão(ões)
          </span>
        )}
      </div>

      {resumo.capituloAtual && (
        <>
          <p className="text-sm font-bold" style={{ color: cores.contorno }}>
            {resumo.capituloAtual.titulo}
          </p>
          <BarraProgresso progresso={resumo.progressoCapituloAtual} corPreenchimento={resumo.materia.cor} />
        </>
      )}

      <BotaoPrincipal onClick={onEstudar}>{acao.rotulo}</BotaoPrincipal>
    </Card>
  )
}

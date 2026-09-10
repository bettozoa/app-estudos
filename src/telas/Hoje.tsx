import { decidirAcaoDoDia } from '../domain/decidirAcaoDoDia'
import { BarraProgresso, BotaoPrincipal, Card, cores, Mascote } from '../design'
import type { ResumoMateria } from '../app/resumoMateria'

interface HojeProps {
  resumos: ResumoMateria[]
  hoje: Date
  onEstudar: (materiaId: string) => void
}

export function Hoje({ resumos, hoje, onEstudar }: HojeProps) {
  return (
    <main className="mx-auto flex max-w-md flex-col gap-5 p-5" style={{ backgroundColor: cores.fundo, minHeight: '100vh' }}>
      <div className="flex flex-col items-center gap-2 pt-4">
        <Mascote estado="acenando" />
        <p className="text-xl font-extrabold" style={{ color: cores.contorno }}>
          Vamos estudar?
        </p>
      </div>

      {resumos.map((resumo) => (
        <CartaoMateria key={resumo.materia.id} resumo={resumo} hoje={hoje} onEstudar={() => onEstudar(resumo.materia.id)} />
      ))}
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

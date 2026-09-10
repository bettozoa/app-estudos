import { useEffect, useState, type FormEvent } from 'react'
import { BotaoPrincipal, Card, cores, Mascote } from '../design'
import { criarAluno, listarAlunos, type Aluno } from '../data/alunos'

interface SelecaoPerfilProps {
  responsavelId: string
  onSelecionar: (aluno: Aluno) => void
}

export function SelecaoPerfil({ responsavelId, onSelecionar }: SelecaoPerfilProps) {
  const [alunos, setAlunos] = useState<Aluno[] | null>(null)
  const [apelido, setApelido] = useState('')
  const [serie, setSerie] = useState('')
  const [criando, setCriando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    listarAlunos()
      .then(setAlunos)
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Erro ao carregar perfis'))
  }, [])

  async function criar(evento: FormEvent) {
    evento.preventDefault()
    setCriando(true)
    setErro(null)
    try {
      const novo = await criarAluno(responsavelId, apelido, serie)
      onSelecionar(novo)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao criar perfil')
    } finally {
      setCriando(false)
    }
  }

  if (alunos === null) {
    return <div className="p-6 text-center">Carregando...</div>
  }

  return (
    <main
      className="mx-auto flex max-w-md flex-col gap-4 p-5"
      style={{ backgroundColor: cores.fundo, minHeight: '100vh', color: cores.contorno }}
    >
      <div className="flex flex-col items-center gap-2 pt-2">
        <Mascote estado="acenando" />
        <p className="text-lg font-extrabold">Quem vai estudar?</p>
      </div>

      {alunos.map((aluno) => (
        <Card key={aluno.id} className="flex flex-col gap-2">
          <span className="font-bold">
            {aluno.apelido}
            {aluno.serie ? ` — ${aluno.serie}` : ''}
          </span>
          <BotaoPrincipal onClick={() => onSelecionar(aluno)}>Entrar</BotaoPrincipal>
        </Card>
      ))}

      <Card className="flex flex-col gap-2">
        <p className="font-bold">Criar novo perfil</p>
        <form onSubmit={criar} className="flex flex-col gap-2">
          <input
            required
            value={apelido}
            onChange={(evento) => setApelido(evento.target.value)}
            placeholder="Apelido"
            className="rounded-lg p-2 text-base"
            style={{ border: `3px solid ${cores.contorno}` }}
          />
          <input
            value={serie}
            onChange={(evento) => setSerie(evento.target.value)}
            placeholder="Série (opcional)"
            className="rounded-lg p-2 text-base"
            style={{ border: `3px solid ${cores.contorno}` }}
          />
          {erro && (
            <p className="text-sm font-bold" style={{ color: cores.laranja }}>
              {erro}
            </p>
          )}
          <BotaoPrincipal variante="secundaria" type="submit" disabled={criando}>
            {criando ? 'Criando...' : 'Criar perfil'}
          </BotaoPrincipal>
        </form>
      </Card>
    </main>
  )
}

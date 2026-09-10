import { useEffect, useState } from 'react'
import type { Aluno } from '../data/alunos'
import { Entrada } from '../telas/Entrada'
import { SelecaoPerfil } from '../telas/SelecaoPerfil'
import { Fluxo } from './Fluxo'
import { useAuth } from './useAuth'

const CHAVE_PERFIL_ATIVO = 'app-estudos:perfil-ativo'

export function Raiz() {
  const sessao = useAuth()
  const [perfil, setPerfil] = useState<Aluno | null>(null)

  useEffect(() => {
    if (!sessao) {
      setPerfil(null)
      return
    }
    const salvo = localStorage.getItem(CHAVE_PERFIL_ATIVO)
    if (!salvo) return
    try {
      setPerfil(JSON.parse(salvo) as Aluno)
    } catch {
      localStorage.removeItem(CHAVE_PERFIL_ATIVO)
    }
  }, [sessao])

  function escolherPerfil(aluno: Aluno) {
    localStorage.setItem(CHAVE_PERFIL_ATIVO, JSON.stringify(aluno))
    setPerfil(aluno)
  }

  if (!sessao) return <Entrada />
  if (!perfil) return <SelecaoPerfil responsavelId={sessao.user.id} onSelecionar={escolherPerfil} />
  return <Fluxo aluno={perfil} onAtualizarAluno={escolherPerfil} />
}

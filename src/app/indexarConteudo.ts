import { carregarConteudo, type Capitulo, type Modulo } from '../data/carregarConteudo'
import type { Questao } from '../domain/tipos'

export interface CapituloComQuestoes extends Capitulo {
  modulos: Modulo[]
  questoes: Questao[]
}

export interface MateriaIndexada {
  id: string
  nome: string
  emoji: string
  cor: string
  capitulos: CapituloComQuestoes[]
}

// Reagrupa o conteúdo plano de carregarConteudo() por matéria/capítulo, usando o prefixo do id
// hierárquico ("hist.c6.m1.q01" pertence ao módulo "hist.c6.m1", do capítulo "hist.c6") —
// é exatamente para isso que os ids são estáveis e hierárquicos (regra 3 do CLAUDE.md).
export function indexarConteudo(): MateriaIndexada[] {
  const { materias, capitulos, modulos, questoes } = carregarConteudo()

  return Object.entries(materias)
    .sort((a, b) => a[1].ordem - b[1].ordem)
    .map(([materiaId, info]) => {
      const capitulosDaMateria = capitulos
        .filter((c) => c.materiaId === materiaId && c.publicado)
        .sort((a, b) => a.ordem - b.ordem)
        .map((cap) => ({
          ...cap,
          modulos: modulos.filter((m) => m.id.startsWith(`${cap.id}.`)).sort((a, b) => a.ordem - b.ordem),
          questoes: questoes.filter((q) => q.moduloId.startsWith(`${cap.id}.`)),
        }))

      return { id: materiaId, nome: info.nome, emoji: info.emoji, cor: info.cor, capitulos: capitulosDaMateria }
    })
}

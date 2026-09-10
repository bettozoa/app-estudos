import type { Questao, TipoQuestao } from '../domain/tipos'

export interface Modulo {
  id: string
  titulo: string
  ordem: number
}

export interface Capitulo {
  id: string
  materiaId: string
  titulo: string
  livro: string
  paginas: string
  ordem: number
  publicado: boolean
}

export interface MateriaInfo {
  nome: string
  emoji: string
  cor: string
  ordem: number
  sub: string
}

export interface ConteudoCarregado {
  materias: Record<string, MateriaInfo>
  capitulos: Capitulo[]
  modulos: Modulo[]
  questoes: Questao[]
}

interface QuestaoArquivo {
  id: string
  modulo_id: string
  tipo: TipoQuestao
  enunciado: string
  apoio: string | null
  alternativas: string[] | null
  correta: number | null
  pares: [string, string][] | null
  explicacao: string
  fonte: string
  dificuldade: number
  ativo: boolean
}

interface ArquivoCapitulo {
  capitulo: {
    id: string
    materia_id: string
    titulo: string
    livro: string
    paginas: string
    ordem: number
    publicado: boolean
  }
  modulos: Modulo[]
  questoes: QuestaoArquivo[]
}

// Content vive em conteudo/<materia>/<capitulo>.json (fora de src/), lido em tempo de build.
// Adicionar um capítulo novo é só criar o arquivo — nada aqui precisa mudar (import.meta.glob pega tudo).
const arquivosCapitulo = import.meta.glob<ArquivoCapitulo>('/conteudo/*/*.json', {
  eager: true,
  import: 'default',
})
const arquivosMaterias = import.meta.glob<Record<string, MateriaInfo>>('/conteudo/materias.json', {
  eager: true,
  import: 'default',
})

export function carregarConteudo(): ConteudoCarregado {
  const capitulos: Capitulo[] = []
  const modulos: Modulo[] = []
  const questoes: Questao[] = []

  for (const arquivo of Object.values(arquivosCapitulo)) {
    capitulos.push({
      id: arquivo.capitulo.id,
      materiaId: arquivo.capitulo.materia_id,
      titulo: arquivo.capitulo.titulo,
      livro: arquivo.capitulo.livro,
      paginas: arquivo.capitulo.paginas,
      ordem: arquivo.capitulo.ordem,
      publicado: arquivo.capitulo.publicado,
    })
    modulos.push(...arquivo.modulos)
    questoes.push(
      ...arquivo.questoes.map(
        (q): Questao => ({
          id: q.id,
          moduloId: q.modulo_id,
          tipo: q.tipo,
          enunciado: q.enunciado,
          apoio: q.apoio,
          alternativas: q.alternativas,
          correta: q.correta,
          pares: q.pares,
          explicacao: q.explicacao,
          fonte: q.fonte,
          dificuldade: q.dificuldade,
          ativo: q.ativo,
        }),
      ),
    )
  }

  const materias = Object.values(arquivosMaterias)[0] ?? {}

  return { materias, capitulos, modulos, questoes }
}

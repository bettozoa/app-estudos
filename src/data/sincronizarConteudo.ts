import { db } from './db'
import { buscarConteudoCompleto, buscarVersaoRemota } from './conteudoRemoto'

const CHAVE_VERSAO = 'versao'

export async function obterVersaoLocal(): Promise<number | null> {
  const linha = await db.conteudoMeta.get(CHAVE_VERSAO)
  return linha ? Number(linha.valor) : null
}

// Compara conteudo_versao remota com a local; se mudou, baixa tudo de novo e substitui o
// cache local por completo (é um retrato, não incremental — o volume de conteúdo é pequeno
// o bastante pra isso ser simples e não valer a pena um diff).
export async function sincronizarConteudoSeNecessario(): Promise<boolean> {
  const versaoRemota = await buscarVersaoRemota()
  const versaoLocal = await obterVersaoLocal()

  if (versaoLocal === versaoRemota) return false

  const { materias, capitulos, modulos, questoes } = await buscarConteudoCompleto()

  await db.transaction(
    'rw',
    [db.conteudoMaterias, db.conteudoCapitulos, db.conteudoModulos, db.conteudoQuestoes, db.conteudoMeta],
    async () => {
      await Promise.all([
        db.conteudoMaterias.clear(),
        db.conteudoCapitulos.clear(),
        db.conteudoModulos.clear(),
        db.conteudoQuestoes.clear(),
      ])

      await db.conteudoMaterias.bulkPut(materias.map((m) => ({ id: m.id, nome: m.nome, emoji: m.emoji, cor: m.cor, ordem: m.ordem })))
      await db.conteudoCapitulos.bulkPut(
        capitulos.map((c) => ({
          id: c.id,
          materiaId: c.materia_id,
          titulo: c.titulo,
          livro: c.livro,
          paginas: c.paginas,
          ordem: c.ordem,
          publicado: c.publicado,
        })),
      )
      await db.conteudoModulos.bulkPut(modulos.map((m) => ({ id: m.id, capituloId: m.capitulo_id, titulo: m.titulo, ordem: m.ordem })))
      await db.conteudoQuestoes.bulkPut(
        questoes.map((q) => ({
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
        })),
      )

      await db.conteudoMeta.put({ chave: CHAVE_VERSAO, valor: String(versaoRemota) })
    },
  )

  return true
}

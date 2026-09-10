// Publica conteudo/**/*.json no Supabase: upsert idempotente por id em
// materias/capitulos/modulos/questoes, e incrementa conteudo_versao — é isso que avisa o app
// (ver data/sincronizarConteudo.ts) que há conteúdo novo pra baixar, sem precisar de novo deploy.
//
// Precisa de SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY num .env local (nunca commitado): é a
// única chave que ignora RLS o bastante pra escrever nas tabelas de conteúdo.
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { validarConteudo } from './validar.ts'

interface ArquivoCapitulo {
  capitulo: {
    id: string
    materia_id: string
    titulo: string
    livro: string | null
    paginas: string | null
    ordem: number
    publicado: boolean
  }
  modulos: { id: string; titulo: string; ordem: number }[]
  questoes: Record<string, unknown>[]
}

const raiz = join(import.meta.dirname, '..')
const raizConteudo = join(raiz, 'conteudo')

const url = process.env.SUPABASE_URL
const chaveServico = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !chaveServico) {
  console.error('Faltam SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY. Configure um .env local (nunca commitado).')
  process.exit(1)
}

const supabase = createClient(url, chaveServico)

async function importar() {
  if (!validarConteudo()) {
    process.exit(1)
  }

  const materias = JSON.parse(readFileSync(join(raizConteudo, 'materias.json'), 'utf8')) as Record<
    string,
    { nome: string; emoji: string; cor: string; ordem: number }
  >

  const materiaRows = Object.entries(materias).map(([id, m]) => ({
    id,
    nome: m.nome,
    emoji: m.emoji,
    cor: m.cor,
    ordem: m.ordem,
  }))

  const capituloRows: ArquivoCapitulo['capitulo'][] = []
  const moduloRows: { id: string; capitulo_id: string; titulo: string; ordem: number }[] = []
  const questaoRows: Record<string, unknown>[] = []

  for (const materiaId of Object.keys(materias)) {
    const dir = join(raizConteudo, materiaId)
    if (!existsSync(dir)) continue

    for (const arquivo of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
      const dados = JSON.parse(readFileSync(join(dir, arquivo), 'utf8')) as ArquivoCapitulo
      capituloRows.push(dados.capitulo)
      moduloRows.push(...dados.modulos.map((m) => ({ id: m.id, capitulo_id: dados.capitulo.id, titulo: m.titulo, ordem: m.ordem })))
      questaoRows.push(...dados.questoes)
    }
  }

  const { error: erroMaterias } = await supabase.from('materias').upsert(materiaRows, { onConflict: 'id' })
  if (erroMaterias) throw erroMaterias

  const { error: erroCapitulos } = await supabase.from('capitulos').upsert(capituloRows, { onConflict: 'id' })
  if (erroCapitulos) throw erroCapitulos

  const { error: erroModulos } = await supabase.from('modulos').upsert(moduloRows, { onConflict: 'id' })
  if (erroModulos) throw erroModulos

  const { error: erroQuestoes } = await supabase.from('questoes').upsert(questaoRows, { onConflict: 'id' })
  if (erroQuestoes) throw erroQuestoes

  const { data: versaoAtual, error: erroLeituraVersao } = await supabase
    .from('conteudo_versao')
    .select('versao')
    .eq('id', 1)
    .single()
  if (erroLeituraVersao) throw erroLeituraVersao

  const novaVersao = (versaoAtual?.versao ?? 0) + 1
  const { error: erroVersao } = await supabase
    .from('conteudo_versao')
    .update({ versao: novaVersao, atualizado_em: new Date().toISOString() })
    .eq('id', 1)
  if (erroVersao) throw erroVersao

  console.log(
    `✅ Importado: ${materiaRows.length} matérias, ${capituloRows.length} capítulos, ${moduloRows.length} módulos, ${questaoRows.length} questões.`,
  )
  console.log(`   conteudo_versao agora é ${novaVersao}.`)
}

importar().catch((erro: unknown) => {
  console.error('Falha na importação:', erro)
  process.exit(1)
})

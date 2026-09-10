// Valida todo arquivo em conteudo/<materia>/<capitulo>.json contra schemas/questoes.schema.json,
// mais duas checagens que JSON Schema sozinho não cobre: id de questão duplicado entre arquivos
// (regra 3 do CLAUDE.md: ids são estáveis, nunca podem colidir) e fonte/explicação obrigatórias
// (regra 2 — já reforçado pelo schema, mas checado de novo aqui pra mensagem de erro mais clara).
import Ajv from 'ajv'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const raiz = join(import.meta.dirname, '..')
const raizConteudo = join(raiz, 'conteudo')
const schema = JSON.parse(readFileSync(join(raiz, 'schemas', 'questoes.schema.json'), 'utf8'))

const ajv = new Ajv({ allErrors: true })
const validarSchema = ajv.compile(schema)

interface Questao {
  id: string
  fonte: string
  explicacao: string
}

function listarArquivosDeCapitulo(): string[] {
  const arquivos: string[] = []
  for (const nome of readdirSync(raizConteudo)) {
    const caminho = join(raizConteudo, nome)
    if (!statSync(caminho).isDirectory()) continue
    for (const arquivo of readdirSync(caminho)) {
      if (arquivo.endsWith('.json')) arquivos.push(join(caminho, arquivo))
    }
  }
  return arquivos
}

export function validarConteudo(): boolean {
  let ok = true
  const idsVistos = new Map<string, string>()
  let totalQuestoes = 0

  for (const caminho of listarArquivosDeCapitulo()) {
    const conteudoBruto = readFileSync(caminho, 'utf8')
    const dados = JSON.parse(conteudoBruto)

    if (!validarSchema(dados)) {
      ok = false
      console.error(`\n❌ ${caminho}`)
      for (const erro of validarSchema.errors ?? []) {
        console.error(`   ${erro.instancePath || '(raiz)'}: ${erro.message}`)
      }
      continue
    }

    for (const questao of dados.questoes as Questao[]) {
      totalQuestoes++

      const arquivoAnterior = idsVistos.get(questao.id)
      if (arquivoAnterior) {
        ok = false
        console.error(`\n❌ id duplicado "${questao.id}": aparece em ${caminho} e em ${arquivoAnterior}`)
      } else {
        idsVistos.set(questao.id, caminho)
      }

      if (!questao.fonte?.trim()) {
        ok = false
        console.error(`\n❌ ${caminho}: questão "${questao.id}" sem fonte`)
      }
      if (!questao.explicacao?.trim()) {
        ok = false
        console.error(`\n❌ ${caminho}: questão "${questao.id}" sem explicação`)
      }
    }
  }

  if (ok) {
    console.log(`✅ ${totalQuestoes} questões válidas, nenhum id duplicado, todas com fonte e explicação.`)
  } else {
    console.error('\nValidação falhou — corrija os erros acima antes de importar.')
  }
  return ok
}

const executadoDiretamente = import.meta.url === pathToFileURL(process.argv[1] ?? '').href
if (executadoDiretamente && !validarConteudo()) {
  process.exit(1)
}

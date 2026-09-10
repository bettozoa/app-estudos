# App de estudos — instruções do projeto

App de treino para provas escolares, usado por uma criança de 8 anos. PWA instalável no
Android, funciona offline, sincroniza entre aparelhos.

## Documentos de referência

Leia antes de planejar qualquer fase (não estão importados de propósito — abra sob demanda):

- `docs/PLANO_APP_ESTUDOS.md` — arquitetura, modelo de dados, sincronização, repetição
  espaçada, gamificação, roadmap por fases.
- `docs/PLANO_VISUAL.md` — mascote, paleta, tipografia, componentes e a lógica da tela Hoje.
- `conteudo/` — questões reais já prontas, usadas como seed.

Se algo neste arquivo conflitar com os documentos, este arquivo vence — e me avise.

## Stack

Vite · React · TypeScript · Tailwind · Dexie (IndexedDB) · Supabase · Zustand · Vitest ·
vite-plugin-pwa. Deploy em Cloudflare Pages.

## Comandos

```
npm run dev                 # servidor local
npm run build               # build de produção
npm run test                # Vitest
npm run conteudo:validar    # valida os JSONs contra o schema
npm run conteudo:importar   # importa os JSONs para o Supabase
```

Rode `npm run build` e `npm run test` antes de dizer que uma tarefa terminou.

## Regras invioláveis

1. **Conteúdo nunca é inventado.** Toda questão vem do material escolar enviado. Se faltar
   informação, pergunte — não preencha lacuna com conhecimento geral.
2. **Toda questão tem `fonte`** (livro e página) e `explicacao`. Sem isso, não entra.
3. **Ids de questão são estáveis** (`geo.c6.m3.q02`). Nunca renumere: o progresso das crianças
   está preso ao id.
4. **Progresso não usa localStorage.** É IndexedDB local + Supabase remoto, com fila de sync.
5. **Conteúdo é dado, não código.** Nada de questão ou nome de capítulo hardcoded em `.tsx`.
6. **Nenhum hex solto em componente.** Só `src/design/tokens.ts`.
7. **Alvo de toque mínimo 48px, fonte mínima 16px.** Usuária tem 8 anos.
8. **O mascote nunca repreende.** No erro ele encoraja. Sem som de erro, sem vermelho forte.
9. **Dados de criança ao mínimo:** apelido, série e progresso. A conta é do responsável. Nada
   de nome completo, foto ou localização.

## Como trabalhar

- Uma fase do roadmap por branch (`fase-1-sync`), uma tarefa por vez.
- Antes de codar uma fase, apresente o plano e espere aprovação.
- Lógica de negócio primeiro, como função pura com teste: `agendarProxima`, `montarSessao`,
  `decidirAcaoDoDia`, `calcularXP`, `avaliarConquistas`. Elas são o coração do app.
- UI depois, montada só com os componentes base: `BotaoPrincipal`, `Card`, `CartaoAlternativa`,
  `BarraProgresso`, `Mascote`, `Pilula`.
- Migrations em `supabase/migrations/`, em arquivo. Nunca alterar schema pelo painel.
- Commits pequenos, mensagem em português, no imperativo ("adiciona fila de sync").

## Estado atual

Fases 0, 1, 2 e 3 completas. App roda como PWA instalável, com motor Leitner, design system e
as telas Hoje/Sessão/Fim de sessão/Trilha. Contas via Supabase (link mágico), seleção de
perfil da criança, RLS e fila de sincronização (push de respostas, pull de progresso, com a
regra de conflito) testadas de ponta a ponta contra o projeto real. Gamificação (XP, nível,
moedas, ofensiva com escudo, 7 conquistas de exemplo, trilha visual com nós por módulo)
também testada de ponta a ponta.

**Conteúdo agora vive no banco, não no bundle.** `schemas/questoes.schema.json` +
`scripts/validar.ts` (Ajv, ids duplicados entre arquivos, fonte/explicação obrigatórias) +
`scripts/importar.ts` (upsert idempotente por id, incrementa `conteudo_versao`) publicam
`conteudo/**/*.json` no Supabase — precisa de `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` num
`.env` local, nunca commitado. O app baixa `materias/capitulos/modulos/questoes` e guarda em
cache no Dexie, comparando `conteudo_versao` a cada sincronização; se já existe cache local, a
tela nunca espera rede pra abrir (evita o timeout de ~20-30s do `fetch` do navegador quando
offline de verdade).

Existe um protótipo em `legado/` (HTML de um arquivo só, referência de comportamento, não de
código). `supabase/seed_conteudo.sql` (Fase 1) ficou como registro histórico do adiantamento
pontual feito antes do `importar.ts` existir — não precisa mais ser usado.

Duas coisas descobertas testando a Fase 3 de ponta a ponta (login real via link gerado pela
Admin API, sem depender de e-mail):
1. RLS de `aluno_stats` estava sem policy de `insert` (upsert sempre valida a policy de
   insert, mesmo quando o caminho real é update) — corrigido em
   `supabase/migrations/20260910140759_corrige_rls_aluno_stats.sql`.
2. `useAuth` dependia de `supabase.auth.getSession()`, que pode tentar renovar o token e ficar
   pendurada esperando rede — trocado por leitura direta do localStorage
   (`sb-<project-ref>-auth-token`) mais `onAuthStateChange` pra manter atualizado depois.

Próxima fase: Fase 4 (área do responsável — PIN, cadastro de provas, relatório de erros,
simulado em PDF).

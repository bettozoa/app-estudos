# Prompts por fase — Claude Code

Ordem de uso. Abra o Claude Code na raiz do repositório e vá uma fase por vez, limpando o
contexto (`/clear`) entre elas. Peça o plano antes do código; só aprove depois de ler.

---

## Preparação (uma vez)

```
mkdir app-estudos && cd app-estudos
git init
mkdir -p docs conteudo legado
# copie PLANO_APP_ESTUDOS.md e PLANO_VISUAL.md para docs/
# copie perguntas.json para conteudo/
# copie o app de um arquivo só para legado/
# copie CLAUDE.md para a raiz
claude
```

---

## Fase 0 — Fundação

**Prompt 1 (planejar)**

> Leia `docs/PLANO_APP_ESTUDOS.md` e `docs/PLANO_VISUAL.md`. Vamos fazer a Fase 0 do roadmap:
> app rodando local, PWA instalável, conteúdo lido de `conteudo/perguntas.json`, motor Leitner,
> progresso em IndexedDB, telas Hoje / Sessão / Fim de sessão. Ainda sem contas e sem Supabase.
> Me apresente o plano de implementação em passos, sem escrever código ainda.

**Prompt 2 (motor)**

> Implemente só a camada de domínio, com testes Vitest: `agendarProxima(caixa, acertou)`,
> `montarSessao(...)` e `decidirAcaoDoDia(...)` conforme as seções 6 do plano de arquitetura e
> 5 do plano visual. Funções puras, sem React, sem IO. Cubra os casos de borda: fila vazia,
> nada novo, prova em 3 dias, primeiro dia de uso.

**Prompt 3 (design system)**

> Crie `src/design/tokens.ts` com a paleta e os raios do `docs/PLANO_VISUAL.md`, e os
> componentes base: BotaoPrincipal (com a base 4px e o afundar no toque), Card,
> CartaoAlternativa, BarraProgresso, Pilula e Mascote. O Mascote é um SVG único com prop
> `estado` (acenando, comemorando, pensando, encorajando, dormindo). Faça uma rota `/kitchen`
> mostrando todos os componentes e todos os estados do gato.

**Prompt 4 (telas)**

> Monte as telas Hoje, Sessão e Fim de sessão usando só os componentes base e as funções de
> domínio. O conteúdo vem de `conteudo/perguntas.json`, carregado para o Dexie na primeira
> abertura. O progresso é gravado no Dexie a cada resposta.

**Prompt 5 (PWA)**

> Configure o vite-plugin-pwa: manifest com nome, ícones 192 e 512, display standalone e cor de
> tema. Service worker com precache do app shell e do conteúdo. Fontes Baloo 2 servidas
> localmente via @fontsource. Valide que funciona em modo avião.

*Pronto quando:* instala no celular pelo Chrome, abre offline e a criança consegue estudar os
dois capítulos.

---

## Fase 1 — Contas e sincronização

> Fase 1: Supabase. Crie as migrations com todas as tabelas da seção 4 do plano de arquitetura,
> mais a tabela `provas` da seção 5 do plano visual, com RLS: conteúdo legível por autenticados,
> tudo com `aluno_id` acessível só pelo responsável dono. Depois, auth por link mágico, seleção
> de perfil da criança e a fila de sincronização (push de respostas, pull de progresso), com a
> regra de conflito descrita no plano. Comece pelo plano.

*Pronto quando:* respondo 10 questões no celular e o tablet mostra o mesmo progresso.

---

## Fase 2 — Gamificação

> Fase 2: XP, níveis, moedas, ofensiva com escudo, conquistas e a trilha visual, conforme a
> seção 7 do plano de arquitetura. As regras vão em funções puras testadas
> (`calcularXP`, `atualizarOfensiva`, `avaliarConquistas`). Tela de fim de sessão com o XP
> ganho, ofensiva e conquistas novas. Respeite `prefers-reduced-motion`.

---

## Fase 3 — Conteúdo no banco

> Fase 3: mova o conteúdo dos JSONs para as tabelas. Crie `schemas/questoes.schema.json`,
> `scripts/validar.ts` (Ajv + ids duplicados + fonte obrigatória) e `scripts/importar.ts`
> (upsert idempotente por id, incrementando `conteudo_versao`). O app passa a baixar o conteúdo
> do Supabase e a guardar no Dexie, comparando a versão.

---

## Fase 4 — Área do responsável

> Fase 4: área protegida por PIN com cadastro de provas (matéria, data, capítulos), relatório
> das questões mais erradas por capítulo e geração do simulado em PDF a partir do banco.

---

## Fase 5 — Distribuição

> Fase 5: empacotar a PWA como TWA com Bubblewrap para a Play Store, e lembrete diário por Web
> Push com horário escolhido pelo responsável, no máximo um por dia.

---

## Rotina de cada nova prova

Quando chegar o roteiro da próxima prova:

> Adicione o capítulo novo em `conteudo/`, seguindo o schema. Não invente conteúdo: use só o
> material em `material/` que eu subi. Depois rode a validação e a importação.

Se preferir gerar as questões no chat do Claude com as fotos do livro, é só colar o JSON
resultante em `conteudo/` e pedir só a validação e a importação.

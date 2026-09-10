# Plano de evolução — app de estudos multimatéria

Documento de referência para construir a v1 com Claude Code. Cada seção traz a decisão
recomendada, a alternativa descartada e o motivo.

Companheiro deste documento: `PLANO_VISUAL.md` — identidade visual, mascote, componentes e a
lógica da tela Hoje. Este aqui cuida do que está por baixo; o outro, do que a criança vê.

---

## 1. O que o app precisa ser

| Requisito | Como se traduz em produto |
|---|---|
| Várias matérias e capítulos | Conteúdo é **dado**, nunca código. Novo capítulo = novo registro, sem publicar versão nova do app. |
| Progresso em vários aparelhos | Conta do responsável + perfis de criança, com sincronização automática. |
| Instalável no Android | PWA instalável; opcionalmente empacotada para a Play Store depois. |
| Simples para a criança | Um botão: **Estudar hoje**. O app decide o que cai na sessão. |
| Gamificável | XP, níveis, ofensiva diária, moedas, conquistas, trilha visual por capítulo. |
| Carregar módulos aos poucos | Pipeline: fotos do livro → JSON validado → importação no banco. |

**Princípio central:** o app tem que funcionar offline e sincronizar quando puder. Criança
estudando no carro, no sinal fraco da escola, no tablet sem chip — nada disso pode travar.

---

## 2. Decisões de arquitetura

### 2.1 PWA, não app nativo
Uma base de código só, instalável pelo navegador ("Adicionar à tela inicial"), com ícone,
tela cheia e funcionamento offline via service worker. Depois, se quiser presença na Play
Store, empacota a mesma PWA como **TWA** (Trusted Web Activity) com Bubblewrap — sem
reescrever nada.

*Descartado:* React Native/Flutter. Dobra o trabalho de build e distribuição para ganhar
recursos que este app não usa.

### 2.2 Backend: Supabase
Postgres gerenciado + autenticação + regras de acesso por linha (RLS) + camada gratuita.
Como é SQL puro, o Claude Code trabalha bem: migrations em arquivos, schema versionado.

*Alternativa:* Firebase/Firestore. Funciona, mas o modelo NoSQL complica as consultas de
progresso e as regras de segurança ficam menos legíveis.

*Confira os limites atuais da camada gratuita antes de decidir* — eles mudam.

### 2.3 Conteúdo no banco, autorado em JSON
Você continua escrevendo as questões em arquivos JSON (fáceis de gerar com IA a partir das
fotos do livro). Um script valida contra um schema e importa para o Postgres. O app lê do
banco e guarda uma cópia local.

Ganho: publicar um capítulo novo não exige *deploy*. A criança abre o app e o capítulo
aparece.

### 2.4 Offline-first com fila de sincronização
Todo o conteúdo e todo o progresso ficam em IndexedDB no aparelho. As respostas entram numa
fila local e sobem quando há rede. O app nunca espera o servidor para mostrar a próxima
pergunta.

---

## 3. Stack sugerida

- **Vite + React + TypeScript + Tailwind CSS**
- **vite-plugin-pwa** (Workbox) — service worker, manifest, atualização automática
- **Dexie.js** — IndexedDB (conteúdo em cache + fila de sincronização)
- **@supabase/supabase-js** — auth e dados
- **Zustand** — estado da sessão de estudo
- **Vitest** — testes das funções puras (agendador, XP, conquistas)
- **Cloudflare Pages / Netlify / Vercel** — hospedagem gratuita, deploy automático a cada push

---

## 4. Modelo de dados

```sql
-- ---------- pessoas ----------
responsaveis (id uuid pk = auth.users.id, nome text, criado_em timestamptz)

alunos (
  id uuid pk,
  responsavel_id uuid fk -> responsaveis,
  apelido text,            -- só apelido, sem nome completo
  serie text,
  avatar jsonb,            -- itens equipados
  criado_em timestamptz
)

-- ---------- conteúdo (leitura pública, escrita só por você) ----------
materias  (id text pk, nome text, emoji text, cor text, ordem int)
capitulos (id text pk, materia_id text fk, titulo text, livro text,
           paginas text, ordem int, publicado bool default false)
modulos   (id text pk, capitulo_id text fk, titulo text, ordem int)
questoes  (
  id text pk,              -- id estável e legível: "geo.c6.m3.q02"
  modulo_id text fk,
  tipo text,               -- 'mc' | 'vf' | 'assoc'
  enunciado text,
  apoio text,              -- texto de apoio opcional
  alternativas jsonb,      -- ['a','b','c','d']
  correta int,
  pares jsonb,             -- para 'assoc'
  explicacao text,
  fonte text,              -- "L3 p.89"
  dificuldade int default 2,
  ativo bool default true
)
conteudo_versao (id int pk default 1, versao int, atualizado_em timestamptz)

-- ---------- progresso ----------
progresso (
  aluno_id uuid,
  questao_id text,
  caixa int default 1,          -- Leitner 1..5
  acertos int, erros int,
  proxima_revisao date,
  ultima_resposta timestamptz,
  atualizado_em timestamptz,
  primary key (aluno_id, questao_id)
)

respostas (                     -- log bruto, para relatórios
  id bigserial pk, aluno_id uuid, questao_id text,
  acertou bool, ms int, criado_em timestamptz
)

-- ---------- provas marcadas ----------
provas (
  id uuid pk,
  aluno_id uuid fk -> alunos,
  materia_id text fk,
  titulo text,             -- "Prova 3ª etapa"
  data date,
  capitulos text[],        -- ids dos capítulos cobrados
  criada_por uuid fk -> responsaveis
)

-- ---------- gamificação ----------
aluno_stats (
  aluno_id uuid pk, xp int, nivel int, moedas int,
  ofensiva int, melhor_ofensiva int, escudos int,
  ultimo_dia_ativo date, atualizado_em timestamptz
)
conquistas (codigo text pk, nome text, descricao text, icone text, regra jsonb)
aluno_conquistas (aluno_id uuid, conquista_codigo text, obtida_em timestamptz,
                  primary key (aluno_id, conquista_codigo))
```

**RLS:** conteúdo é `select` liberado para autenticados; tudo que tem `aluno_id` só é
acessível se o aluno pertencer ao `auth.uid()` logado.

---

## 5. Sincronização

1. **Pull de conteúdo:** ao abrir, o app compara `conteudo_versao.versao` com a versão local.
   Se mudou, baixa o que falta e grava no IndexedDB.
2. **Push de progresso:** cada resposta vira um item na fila local. Um worker esvazia a fila
   com `upsert` em `progresso` e `insert` em `respostas`.
3. **Pull de progresso:** ao abrir e a cada X minutos, busca `progresso` com
   `atualizado_em > ultima_sincronizacao`.
4. **Conflito** (mesma questão respondida em dois aparelhos offline): vence a linha com
   `ultima_resposta` mais recente; para `caixa`, vence o **menor** valor — se errou em algum
   lugar, precisa revisar de novo. É o desempate mais seguro pedagogicamente.

---

## 6. Motor de repetição espaçada

Substitui a regra atual ("volta 3 perguntas depois"), que só vale dentro da sessão.

**Leitner de 5 caixas:**

| Caixa | Volta em |
|---|---|
| 1 | mesmo dia |
| 2 | 1 dia |
| 3 | 3 dias |
| 4 | 7 dias |
| 5 | 16 dias |

- Acertou → sobe uma caixa e agenda `proxima_revisao`.
- Errou → volta para a caixa 1 e reaparece **ainda na mesma sessão**, algumas perguntas depois.
- Questão em caixa 5 acertada = "dominada" (conta para o progresso do capítulo).

**Montagem da sessão de "Estudar hoje"** (alvo: 15–20 questões):
1. Todas as revisões vencidas (`proxima_revisao <= hoje`), até 60% da sessão.
2. Completa com questões novas do módulo atual, na ordem dos capítulos publicados.
3. Se não houver nada vencido nem nada novo, oferece um **treino livre** do capítulo escolhido.
4. Se houver prova marcada em até 7 dias, a mistura vira 70% do capítulo cobrado + 30% do resto
   da fila. Na véspera, o app abre o modo **Revisão de prova**: varre o capítulo inteiro
   ignorando o agendamento, priorizando o que a criança mais errou.

Quem decide qual dessas situações vale hoje é a função `decidirAcaoDoDia(revisoesVencidas,
capituloAtual, provasProximas, hoje)`, detalhada na seção 5 do `PLANO_VISUAL.md`. Ela é o único
lugar do app que escolhe o que a tela inicial mostra.

Antes da prova, um modo extra: **"Revisão de prova"** — filtra por capítulo e ignora o
agendamento, varrendo tudo.

---

## 7. Gamificação

**Economia**
- XP: +10 acerto de primeira · +6 acerto em revisão · +3 acerto depois de errar · 0 no erro
  (erro não tira ponto — perder pontos desestimula tentar).
- Nível: curva suave, `xp_necessario(n) = 100 * n^1.3`.
- Moedas: 1 a cada 20 XP + bônus de missão concluída.
- Loja: cores de tema, acessórios de avatar, molduras. Nada que dê vantagem no estudo.

**Ofensiva (streak)**
- Meta diária pequena e alcançável: 1 sessão ou 10 questões.
- **Escudo:** ganha 1 a cada 7 dias seguidos, gasta automaticamente para perdoar um dia
  perdido (máx. 2 guardados). Evita a frustração que faz criança abandonar o app.

**Conquistas** (exemplos)
- "Primeiro módulo", "Capítulo 100%", "Sete dias seguidos", "50 revisões em dia",
  "Zerou a fila de revisão", "Acertou 20 seguidas", "Explorador" (estudou 3 matérias).

**Visual de progresso**
- Trilha de nós por capítulo (módulo bloqueado → em andamento → dominado), com anel de
  domínio que enche conforme as questões chegam à caixa 5.

**Limites que valem manter**
- Sem ranking com desconhecidos. Se quiser competição, só entre irmãos/família.
- Sem cronômetro por padrão (só num modo "prova relâmpago" opcional).
- Sem "vidas" que impedem de continuar estudando.

---

## 8. Telas (v1)

1. **Entrada** — login do responsável (link mágico por e-mail) → escolha do perfil da criança.
2. **Casa** — saudação, ofensiva, XP/nível, botão grande **Estudar hoje**, cartão "X revisões
   te esperando", atalhos por matéria.
3. **Sessão** — uma pergunta por vez, feedback imediato com explicação e fonte, barra de
   progresso da sessão. (Reaproveitar o visual do app atual — já está validado com a criança.)
4. **Fim de sessão** — XP ganho, ofensiva, conquistas novas, o que errou.
5. **Trilha** — matéria → capítulos → módulos, com % de domínio.
6. **Perfil/Loja** — avatar, conquistas, moedas.
7. **Área do responsável** (protegida por PIN) — relatório por capítulo, o que a criança mais
   erra, gerar simulado em PDF.

---

## 9. Pipeline de conteúdo

```
conteudo/
  geografia/
    cap-06-recursos-naturais.json
    cap-07-agua.json
  historia/
    cap-06-cidades.json
schemas/questoes.schema.json
scripts/validar.ts     # Ajv contra o schema + ids duplicados + fonte obrigatória
scripts/importar.ts    # upsert idempotente no Supabase + incrementa conteudo_versao
```

Fluxo: fotografa o livro → gera o JSON com IA → `npm run conteudo:validar` →
`npm run conteudo:importar` → publica o capítulo (`publicado = true`).

**Regras do schema:** `id` estável e único, `fonte` obrigatória (livro e página), `explicacao`
obrigatória, `alternativas` com 4 itens para `mc`, e nada de conteúdo fora do material do livro.
Ids estáveis são o que permite corrigir uma questão sem zerar o progresso de quem já respondeu.

---

## 10. Instalação no Android

**Etapa 1 — PWA (já resolve).** `manifest.webmanifest` com `display: standalone`, ícones
192/512, tema; service worker com cache de app shell + conteúdo. O Chrome oferece "Instalar".

**Etapa 2 — Play Store (opcional).** Bubblewrap gera o TWA, exige `assetlinks.json` no domínio
e conta de desenvolvedor Google (taxa única). Só vale a pena se quiser distribuir para outras
famílias.

**Notificações de lembrete:** Web Push funciona no Android. Deixe para depois da v1 e trate
com cuidado — no máximo um lembrete diário, no horário que o responsável escolher.

---

## 11. Roadmap

**Fase 0 — Fundação (app já usável, sem conta)**
Vite+React+TS+Tailwind, PWA instalável, conteúdo lido dos JSONs locais, motor Leitner,
progresso em IndexedDB, telas Casa/Sessão/Fim. *Pronto quando:* instala no celular, funciona
em modo avião e a criança consegue estudar os dois capítulos que já existem.

**Fase 1 — Contas e sincronização**
Supabase, auth por link mágico, perfis de aluno, tabelas de progresso, fila de sync, RLS.
*Pronto quando:* responde 10 questões no celular e o tablet mostra o mesmo progresso.

**Fase 2 — Gamificação**
XP, níveis, moedas, ofensiva com escudo, conquistas, trilha visual, tela de fim de sessão.
*Pronto quando:* as funções de XP/ofensiva/conquistas têm teste unitário passando.

**Fase 3 — Conteúdo no banco**
Migração dos JSONs para as tabelas, `conteudo_versao`, scripts de validação e importação,
capítulos publicáveis. *Pronto quando:* você importa um capítulo novo e ele aparece no
aparelho sem novo deploy.

**Fase 4 — Área do responsável**
PIN, cadastro de provas (matéria, data, capítulos), relatório de erros por capítulo e geração
do simulado em PDF a partir do banco. O cadastro de prova é o que liga o modo de treino
direcionado descrito na seção 6.

**Fase 5 — Distribuição**
TWA/Play Store, Web Push, convite para outras famílias (se fizer sentido).

---

## 12. Como conduzir o Claude Code

- **CLAUDE.md na raiz** com: stack, comandos (`dev`, `test`, `conteudo:validar`), padrão de
  commits, e as regras invioláveis — *conteúdo nunca é inventado*, *toda questão tem fonte*,
  *ids são estáveis*, *nada de localStorage para progresso (é IndexedDB + Supabase)*.
- **Uma fase por branch**, uma tarefa por vez. Peça o plano antes do código em cada fase.
- **Funções puras testadas primeiro:** `agendarProxima(caixa, acertou)`, `montarSessao(...)`,
  `calcularXP(...)`, `avaliarConquistas(...)`, `decidirAcaoDoDia(...)`. São o coração do app e o
  que mais dói se quebrar.
- **Migrations em arquivos** (`supabase/migrations/`), nunca alteração manual pelo painel.
- **Seeds** com o conteúdo atual, para o ambiente de desenvolvimento ter dados de verdade.
- Peça a ele que **rode o build e os testes** antes de dizer que terminou.

---

## 13. Decisões que dependem de você

1. Quantas crianças vão usar? (perfis irmãos mudam a tela de entrada)
2. O app é só da família ou você pretende abrir para outras? (muda LGPD, suporte e custo)
3. Quer a Play Store ou "adicionar à tela inicial" basta?
4. Quem vai autorar o conteúdo além de você?
5. Lembrete diário por notificação: sim ou não?

E um alerta de privacidade: como o usuário final é criança, guarde o mínimo — apelido, série e
progresso. A conta é do responsável. Nada de foto, nome completo ou localização.

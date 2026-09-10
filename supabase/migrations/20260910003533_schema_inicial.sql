-- Schema inicial (Fase 1) — seção 4 do docs/PLANO_APP_ESTUDOS.md + tabela `provas` da
-- seção 5 do docs/PLANO_VISUAL.md. Ids de conteúdo são text (ex.: "hist.c6.m1.q01") porque
-- são estáveis e hierárquicos, definidos em conteudo/ — nunca gerados pelo banco.

create extension if not exists pgcrypto;

-- ---------- pessoas ----------

create table public.responsaveis (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text,
  criado_em timestamptz not null default now()
);

create table public.alunos (
  id uuid primary key default gen_random_uuid(),
  responsavel_id uuid not null references public.responsaveis (id) on delete cascade,
  apelido text not null,
  serie text,
  avatar jsonb not null default '{}'::jsonb,
  criado_em timestamptz not null default now()
);

-- ---------- conteúdo (leitura pública para autenticados, escrita só via service_role) ----------

create table public.materias (
  id text primary key,
  nome text not null,
  emoji text,
  cor text,
  ordem int not null default 0
);

create table public.capitulos (
  id text primary key,
  materia_id text not null references public.materias (id),
  titulo text not null,
  livro text,
  paginas text,
  ordem int not null default 0,
  publicado boolean not null default false
);

create table public.modulos (
  id text primary key,
  capitulo_id text not null references public.capitulos (id),
  titulo text not null,
  ordem int not null default 0
);

create table public.questoes (
  id text primary key,
  modulo_id text not null references public.modulos (id),
  tipo text not null check (tipo in ('mc', 'vf', 'assoc')),
  enunciado text not null,
  apoio text,
  alternativas jsonb,
  correta int,
  pares jsonb,
  explicacao text not null,
  fonte text not null,
  dificuldade int not null default 2,
  ativo boolean not null default true
);

-- Singleton: uma única linha (id sempre 1), incrementada a cada importação de conteúdo (Fase 3).
create table public.conteudo_versao (
  id int primary key default 1 check (id = 1),
  versao int not null default 1,
  atualizado_em timestamptz not null default now()
);
insert into public.conteudo_versao (id, versao) values (1, 1);

-- ---------- progresso ----------

create table public.progresso (
  aluno_id uuid not null references public.alunos (id) on delete cascade,
  questao_id text not null references public.questoes (id),
  caixa int not null default 1 check (caixa between 1 and 5),
  acertos int not null default 0,
  erros int not null default 0,
  proxima_revisao date not null default current_date,
  ultima_resposta timestamptz,
  atualizado_em timestamptz not null default now(),
  primary key (aluno_id, questao_id)
);

create table public.respostas (
  id bigserial primary key,
  aluno_id uuid not null references public.alunos (id) on delete cascade,
  questao_id text not null references public.questoes (id),
  acertou boolean not null,
  ms int,
  criado_em timestamptz not null default now()
);

-- ---------- provas marcadas (seção 5 do PLANO_VISUAL.md) ----------

create table public.provas (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references public.alunos (id) on delete cascade,
  materia_id text not null references public.materias (id),
  titulo text not null,
  data date not null,
  capitulos text[] not null default '{}',
  criada_por uuid not null references public.responsaveis (id)
);

-- ---------- índices de consulta frequente ----------

create index idx_alunos_responsavel on public.alunos (responsavel_id);
create index idx_capitulos_materia_ordem on public.capitulos (materia_id, ordem);
create index idx_modulos_capitulo_ordem on public.modulos (capitulo_id, ordem);
create index idx_questoes_modulo on public.questoes (modulo_id);
create index idx_progresso_aluno_revisao on public.progresso (aluno_id, proxima_revisao);
create index idx_respostas_aluno_criado on public.respostas (aluno_id, criado_em);
create index idx_provas_aluno_data on public.provas (aluno_id, data);

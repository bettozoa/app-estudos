-- Gamificação (Fase 2) — seção 4/7 do docs/PLANO_APP_ESTUDOS.md. Essas três tabelas já
-- estavam na seção 4 desde a Fase 1, mas ficaram de fora daquela migration por engano.

create table public.aluno_stats (
  aluno_id uuid primary key references public.alunos (id) on delete cascade,
  xp int not null default 0,
  nivel int not null default 1,
  moedas int not null default 0,
  ofensiva int not null default 0,
  melhor_ofensiva int not null default 0,
  escudos int not null default 0,
  ultimo_dia_ativo date,
  -- Contador simples para a conquista "50 revisões em dia": incrementado a cada acerto de
  -- uma questão que já estava em revisão (não é a primeira resposta). Não está no plano
  -- original — é o jeito mais direto de dar suporte a essa conquista sem reconstruir o
  -- histórico de respostas toda vez.
  revisoes_em_dia_total int not null default 0,
  atualizado_em timestamptz not null default now()
);

-- Conteúdo (leitura pública para autenticados, escrita só via service_role — igual materias/etc.)
create table public.conquistas (
  codigo text primary key,
  nome text not null,
  descricao text not null,
  icone text,
  regra jsonb
);

create table public.aluno_conquistas (
  aluno_id uuid not null references public.alunos (id) on delete cascade,
  conquista_codigo text not null references public.conquistas (codigo),
  obtida_em timestamptz not null default now(),
  primary key (aluno_id, conquista_codigo)
);

-- ---------- RLS: mesmo padrão das demais tabelas (conteúdo público / dados só do dono) ----------

alter table public.aluno_stats enable row level security;
alter table public.conquistas enable row level security;
alter table public.aluno_conquistas enable row level security;

create policy "conteudo_select_autenticados" on public.conquistas
  for select to authenticated using (true);

create policy "aluno_stats_select_dono" on public.aluno_stats
  for select using (
    exists (select 1 from public.alunos a where a.id = aluno_stats.aluno_id and a.responsavel_id = auth.uid())
  );

create policy "aluno_stats_update_dono" on public.aluno_stats
  for update using (
    exists (select 1 from public.alunos a where a.id = aluno_stats.aluno_id and a.responsavel_id = auth.uid())
  );

create policy "aluno_conquistas_select_dono" on public.aluno_conquistas
  for select using (
    exists (select 1 from public.alunos a where a.id = aluno_conquistas.aluno_id and a.responsavel_id = auth.uid())
  );

create policy "aluno_conquistas_insert_dono" on public.aluno_conquistas
  for insert with check (
    exists (select 1 from public.alunos a where a.id = aluno_conquistas.aluno_id and a.responsavel_id = auth.uid())
  );

-- ---------- trigger: cria a linha de stats junto com o aluno ----------

create or replace function public.criar_stats_do_aluno()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.aluno_stats (aluno_id) values (new.id)
  on conflict (aluno_id) do nothing;
  return new;
end;
$$;

create trigger ao_criar_aluno
  after insert on public.alunos
  for each row execute function public.criar_stats_do_aluno();

-- Mesmo padrão de progresso: atualizado_em sempre reflete a última escrita no servidor.
create trigger aluno_stats_marcar_atualizado_em
  before insert or update on public.aluno_stats
  for each row execute function public.marcar_atualizado_em();

-- ---------- seed das conquistas de exemplo (seção 7 do PLANO_APP_ESTUDOS.md) ----------

insert into public.conquistas (codigo, nome, descricao, icone, regra) values
  ('primeiro_modulo', 'Primeiro módulo', 'Terminou o primeiro módulo de uma matéria.', '🌟', '{"tipo": "modulo_concluido", "quantidade": 1}'),
  ('capitulo_completo', 'Capítulo 100%', 'Dominou todas as questões de um capítulo.', '🏆', '{"tipo": "capitulo_dominado"}'),
  ('sete_dias', 'Sete dias seguidos', 'Estudou 7 dias seguidos.', '🔥', '{"tipo": "ofensiva_minima", "dias": 7}'),
  ('cinquenta_revisoes', '50 revisões em dia', 'Fez 50 revisões sem deixar nenhuma vencer.', '📚', '{"tipo": "revisoes_em_dia", "quantidade": 50}'),
  ('fila_zerada', 'Zerou a fila de revisão', 'Não deixou nenhuma revisão pendente.', '✨', '{"tipo": "fila_vazia"}'),
  ('vinte_seguidas', 'Acertou 20 seguidas', 'Acertou 20 questões seguidas na mesma sessão.', '⚡', '{"tipo": "sequencia_acertos", "quantidade": 20}'),
  ('explorador', 'Explorador', 'Estudou 3 matérias diferentes.', '🧭', '{"tipo": "materias_distintas", "quantidade": 3}')
on conflict (codigo) do nothing;

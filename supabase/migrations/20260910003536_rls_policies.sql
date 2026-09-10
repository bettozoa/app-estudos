-- RLS (regra do CLAUDE.md/seção 4): conteúdo é SELECT liberado para autenticados;
-- tudo que tem aluno_id só é acessível se o aluno pertencer ao auth.uid() logado.
-- Nenhuma policy de escrita é criada para as tabelas de conteúdo: sem policy, a escrita
-- fica bloqueada para o client (só o service_role da Fase 3 escreve lá, e service_role
-- ignora RLS por padrão).

alter table public.responsaveis enable row level security;
alter table public.alunos enable row level security;
alter table public.materias enable row level security;
alter table public.capitulos enable row level security;
alter table public.modulos enable row level security;
alter table public.questoes enable row level security;
alter table public.conteudo_versao enable row level security;
alter table public.progresso enable row level security;
alter table public.respostas enable row level security;
alter table public.provas enable row level security;

-- ---------- conteúdo: leitura liberada para qualquer autenticado ----------

create policy "conteudo_select_autenticados" on public.materias
  for select to authenticated using (true);

create policy "conteudo_select_autenticados" on public.capitulos
  for select to authenticated using (true);

create policy "conteudo_select_autenticados" on public.modulos
  for select to authenticated using (true);

create policy "conteudo_select_autenticados" on public.questoes
  for select to authenticated using (true);

create policy "conteudo_select_autenticados" on public.conteudo_versao
  for select to authenticated using (true);

-- ---------- responsaveis: só o próprio ----------

create policy "responsavel_select_proprio" on public.responsaveis
  for select using (id = auth.uid());

create policy "responsavel_update_proprio" on public.responsaveis
  for update using (id = auth.uid());

-- ---------- alunos: só do responsável dono ----------

create policy "alunos_select_dono" on public.alunos
  for select using (responsavel_id = auth.uid());

create policy "alunos_insert_dono" on public.alunos
  for insert with check (responsavel_id = auth.uid());

create policy "alunos_update_dono" on public.alunos
  for update using (responsavel_id = auth.uid());

create policy "alunos_delete_dono" on public.alunos
  for delete using (responsavel_id = auth.uid());

-- ---------- progresso: só de alunos do responsável dono ----------

create policy "progresso_select_dono" on public.progresso
  for select using (
    exists (select 1 from public.alunos a where a.id = progresso.aluno_id and a.responsavel_id = auth.uid())
  );

create policy "progresso_insert_dono" on public.progresso
  for insert with check (
    exists (select 1 from public.alunos a where a.id = progresso.aluno_id and a.responsavel_id = auth.uid())
  );

create policy "progresso_update_dono" on public.progresso
  for update using (
    exists (select 1 from public.alunos a where a.id = progresso.aluno_id and a.responsavel_id = auth.uid())
  );

-- ---------- respostas: log só de alunos do responsável dono (sem update/delete: é log bruto) ----------

create policy "respostas_select_dono" on public.respostas
  for select using (
    exists (select 1 from public.alunos a where a.id = respostas.aluno_id and a.responsavel_id = auth.uid())
  );

create policy "respostas_insert_dono" on public.respostas
  for insert with check (
    exists (select 1 from public.alunos a where a.id = respostas.aluno_id and a.responsavel_id = auth.uid())
  );

-- ---------- provas: só de alunos do responsável dono ----------

create policy "provas_select_dono" on public.provas
  for select using (
    exists (select 1 from public.alunos a where a.id = provas.aluno_id and a.responsavel_id = auth.uid())
  );

create policy "provas_insert_dono" on public.provas
  for insert with check (
    exists (select 1 from public.alunos a where a.id = provas.aluno_id and a.responsavel_id = auth.uid())
    and criada_por = auth.uid()
  );

create policy "provas_update_dono" on public.provas
  for update using (
    exists (select 1 from public.alunos a where a.id = provas.aluno_id and a.responsavel_id = auth.uid())
  );

create policy "provas_delete_dono" on public.provas
  for delete using (
    exists (select 1 from public.alunos a where a.id = provas.aluno_id and a.responsavel_id = auth.uid())
  );

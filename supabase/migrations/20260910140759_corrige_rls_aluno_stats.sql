-- Corrige um bug real (achado testando a Fase 3 com um login novo): faltava a policy de
-- insert em aluno_stats. O client faz upsert (insert ... on conflict do update), e o Postgres
-- valida a policy de INSERT mesmo quando a linha já existe e o caminho real é UPDATE — sem
-- essa policy, toda tentativa de salvar XP/ofensiva falhava com "new row violates RLS".
create policy "aluno_stats_insert_dono" on public.aluno_stats
  for insert with check (
    exists (select 1 from public.alunos a where a.id = aluno_stats.aluno_id and a.responsavel_id = auth.uid())
  );

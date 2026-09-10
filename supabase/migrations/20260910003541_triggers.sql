-- Cria a linha em public.responsaveis automaticamente no primeiro login (link mágico cria
-- um auth.users; sem isso o client precisaria lembrar de inserir, e um esquecimento quebraria
-- todas as policies que dependem de responsaveis/alunos existirem).
create or replace function public.lidar_com_novo_usuario()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.responsaveis (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute function public.lidar_com_novo_usuario();

-- Garante que atualizado_em reflita sempre a última escrita no servidor, independente do
-- relógio do aparelho que enviou o upsert — é essa coluna que a Fase 1 usa no pull
-- incremental ("busca progresso com atualizado_em > última sincronização").
create or replace function public.marcar_atualizado_em()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

create trigger progresso_marcar_atualizado_em
  before insert or update on public.progresso
  for each row execute function public.marcar_atualizado_em();

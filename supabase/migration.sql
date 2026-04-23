-- Vamos Fazer O Que? - migration incremental
-- Aplicar este arquivo APENAS uma vez no SQL Editor do Supabase.
-- Contém somente alterações novas após o schema inicial:
-- 1) users.email
-- 2) event_comments + RLS/policies
-- 3) policy de INSERT em users
-- 4) trigger/função com persistência de email em users
-- 5) coluna age_rating em events

-- 1) Nova coluna de email em users
alter table public.users
  add column if not exists email text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'users_email_key'
      and conrelid = 'public.users'::regclass
  ) then
    alter table public.users
      add constraint users_email_key unique (email);
  end if;
end
$$;

-- 2) Tabela event_comments + índice
create table if not exists public.event_comments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists event_comments_event_id_idx
  on public.event_comments(event_id);

-- 3) RLS e policies de event_comments
alter table public.event_comments enable row level security;

drop policy if exists event_comments_select_for_visible_events on public.event_comments;
create policy event_comments_select_for_visible_events
on public.event_comments for select
using (
  exists (
    select 1
    from public.events e
    where e.id = event_id
      and e.status = 'aprovado'
  )
  or public.is_admin()
  or user_id = auth.uid()
);

drop policy if exists event_comments_insert_owner_on_approved_events on public.event_comments;
create policy event_comments_insert_owner_on_approved_events
on public.event_comments for insert
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.events e
    where e.id = event_id
      and e.status = 'aprovado'
  )
);

drop policy if exists event_comments_delete_owner_or_admin on public.event_comments;
create policy event_comments_delete_owner_or_admin
on public.event_comments for delete
using (user_id = auth.uid() or public.is_admin());

-- 4) Policy de INSERT em users
drop policy if exists users_insert_self_or_admin on public.users;
create policy users_insert_self_or_admin
on public.users for insert
with check (id = auth.uid() or public.is_admin());

-- 5) Trigger/função para persistir email no perfil public.users
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, full_name, email, role, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'espectador'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
    set full_name = excluded.full_name,
        email = excluded.email,
        role = excluded.role,
        avatar_url = excluded.avatar_url,
        updated_at = now();

  if coalesce(new.raw_user_meta_data ->> 'role', 'espectador') = 'organizador' then
    insert into public.organizers (user_id, display_name)
    values (
      new.id,
      coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
    )
    on conflict (user_id) do nothing;
  end if;

  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'on_auth_user_created'
      and tgrelid = 'auth.users'::regclass
  ) then
    execute 'create trigger on_auth_user_created
             after insert on auth.users
             for each row execute function public.handle_new_auth_user()';
  end if;
end
$$;

-- 6) Coluna faixa etária em events
alter table public.events
  add column if not exists age_rating text not null default 'Livre';

-- 8) Coluna cover_image_url em events (URL direta da imagem de capa, sem depender de RLS em event_images)
alter table public.events
  add column if not exists cover_image_url text;

-- 7) Fix: stack depth limit exceeded — SECURITY DEFINER nas funções is_admin e is_organizer_of_event
-- Sem SECURITY DEFINER, essas funções são inlineadas pelo PostgreSQL e executam com as
-- permissões do usuário chamador. is_admin() lê public.users, que tem RLS usando is_admin(),
-- causando recursão infinita. SECURITY DEFINER faz a função bypassar RLS internamente.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and (u.is_admin = true or u.role = 'admin')
  );
$$;

create or replace function public.is_organizer_of_event(event_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.events e
    join public.organizers o on o.id = e.organizer_id
    where e.id = event_uuid
      and o.user_id = auth.uid()
  );
$$;

-- 9) Política de DELETE em events — sem ela o Supabase ignora o DELETE silenciosamente
drop policy if exists events_delete_admin on public.events;
create policy events_delete_admin
on public.events for delete
using (
  public.is_admin()
  or exists (
    select 1 from public.organizers o
    where o.id = organizer_id and o.user_id = auth.uid()
  )
);

-- 10) Novos campos para organizers e events (cadastro expandido)
alter table public.organizers
  add column if not exists tipo text not null default 'juridica',
  add column if not exists data_nascimento date,
  add column if not exists endereco text,
  add column if not exists nome_fantasia text,
  add column if not exists responsavel text;

alter table public.events
  add column if not exists local_nome text,
  add column if not exists vinculo text,
  add column if not exists preco decimal(10,2),
  add column if not exists outdoor_indoor text,
  add column if not exists modalidade_esportiva text,
  add column if not exists nivel_competitivo text,
  add column if not exists servicos jsonb;

-- Atualiza trigger para persistir novos campos de organizador no cadastro
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, full_name, email, role, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'espectador'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
    set full_name = excluded.full_name,
        email = excluded.email,
        role = excluded.role,
        avatar_url = excluded.avatar_url,
        updated_at = now();

  if coalesce(new.raw_user_meta_data ->> 'role', 'espectador') = 'organizador' then
    insert into public.organizers (
      user_id, display_name, document, phone,
      tipo, data_nascimento, endereco, nome_fantasia, responsavel
    )
    values (
      new.id,
      coalesce(
        new.raw_user_meta_data ->> 'display_name',
        new.raw_user_meta_data ->> 'full_name',
        split_part(new.email, '@', 1)
      ),
      new.raw_user_meta_data ->> 'document',
      new.raw_user_meta_data ->> 'phone',
      coalesce(new.raw_user_meta_data ->> 'tipo', 'juridica'),
      nullif(new.raw_user_meta_data ->> 'data_nascimento', '')::date,
      new.raw_user_meta_data ->> 'endereco',
      new.raw_user_meta_data ->> 'nome_fantasia',
      new.raw_user_meta_data ->> 'responsavel'
    )
    on conflict (user_id) do update
      set display_name = excluded.display_name,
          document     = excluded.document,
          phone        = excluded.phone,
          tipo         = excluded.tipo,
          data_nascimento = excluded.data_nascimento,
          endereco     = excluded.endereco,
          nome_fantasia = excluded.nome_fantasia,
          responsavel  = excluded.responsavel;
  end if;

  return new;
end;
$$;

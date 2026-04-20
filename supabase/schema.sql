-- Vamos Fazer O Que? - schema inicial
-- Execute este script no SQL Editor do Supabase.

create extension if not exists "pgcrypto";

create type public.user_role as enum ('espectador', 'organizador', 'admin');
create type public.event_status as enum ('pendente', 'aprovado', 'reprovado');
create type public.notification_type as enum ('evento_aprovado', 'evento_reprovado', 'geral');

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text unique,
  role public.user_role not null default 'espectador',
  avatar_url text,
  is_active boolean not null default true,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organizers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  display_name text not null,
  document text,
  phone text,
  bio text,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references public.organizers(id) on delete restrict,
  title text not null,
  slug text not null unique,
  description text not null,
  category text not null,
  event_date date not null,
  start_time time not null,
  end_time time,
  city text not null,
  state text not null,
  address text not null,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  status public.event_status not null default 'pendente',
  rejection_reason text,
  approved_by uuid references public.users(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists events_status_idx on public.events(status);
create index if not exists events_date_idx on public.events(event_date);
create index if not exists events_category_idx on public.events(category);

create table if not exists public.event_images (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  image_url text not null,
  cloudinary_public_id text,
  is_cover boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists event_images_event_id_idx on public.event_images(event_id);

create table if not exists public.event_attractions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  description text,
  starts_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists event_attractions_event_id_idx on public.event_attractions(event_id);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  rating smallint not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(event_id, user_id)
);

create index if not exists reviews_event_id_idx on public.reviews(event_id);

create table if not exists public.event_comments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists event_comments_event_id_idx on public.event_comments(event_id);

create table if not exists public.saved_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, event_id)
);

create index if not exists saved_events_user_id_idx on public.saved_events(user_id);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  event_id uuid references public.events(id) on delete cascade,
  type public.notification_type not null,
  title text not null,
  body text not null,
  sent_via_email boolean not null default false,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_id_idx on public.notifications(user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists organizers_set_updated_at on public.organizers;
create trigger organizers_set_updated_at
before update on public.organizers
for each row execute function public.set_updated_at();

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
before update on public.events
for each row execute function public.set_updated_at();

drop trigger if exists reviews_set_updated_at on public.reviews;
create trigger reviews_set_updated_at
before update on public.reviews
for each row execute function public.set_updated_at();

alter table public.users enable row level security;
alter table public.organizers enable row level security;
alter table public.events enable row level security;
alter table public.event_images enable row level security;
alter table public.event_attractions enable row level security;
alter table public.reviews enable row level security;
alter table public.event_comments enable row level security;
alter table public.saved_events enable row level security;
alter table public.notifications enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
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
as $$
  select exists (
    select 1
    from public.events e
    join public.organizers o on o.id = e.organizer_id
    where e.id = event_uuid
      and o.user_id = auth.uid()
  );
$$;

drop policy if exists users_select_own_or_admin on public.users;
create policy users_select_own_or_admin
on public.users for select
using (id = auth.uid() or public.is_admin());

drop policy if exists users_update_own_or_admin on public.users;
create policy users_update_own_or_admin
on public.users for update
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

drop policy if exists users_insert_self_or_admin on public.users;
create policy users_insert_self_or_admin
on public.users for insert
with check (id = auth.uid() or public.is_admin());

drop policy if exists organizers_select_public on public.organizers;
create policy organizers_select_public
on public.organizers for select
using (true);

drop policy if exists organizers_insert_self_or_admin on public.organizers;
create policy organizers_insert_self_or_admin
on public.organizers for insert
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists organizers_update_self_or_admin on public.organizers;
create policy organizers_update_self_or_admin
on public.organizers for update
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists events_select_approved_or_owner_or_admin on public.events;
create policy events_select_approved_or_owner_or_admin
on public.events for select
using (
  status = 'aprovado'
  or public.is_admin()
  or exists (
    select 1 from public.organizers o
    where o.id = organizer_id and o.user_id = auth.uid()
  )
);

drop policy if exists events_insert_organizer_or_admin on public.events;
create policy events_insert_organizer_or_admin
on public.events for insert
with check (
  public.is_admin()
  or exists (
    select 1 from public.organizers o
    where o.id = organizer_id and o.user_id = auth.uid()
  )
);

drop policy if exists events_update_owner_or_admin on public.events;
create policy events_update_owner_or_admin
on public.events for update
using (
  public.is_admin()
  or exists (
    select 1 from public.organizers o
    where o.id = organizer_id and o.user_id = auth.uid()
  )
)
with check (
  public.is_admin()
  or exists (
    select 1 from public.organizers o
    where o.id = organizer_id and o.user_id = auth.uid()
  )
);

drop policy if exists event_images_select_for_visible_events on public.event_images;
create policy event_images_select_for_visible_events
on public.event_images for select
using (
  exists (
    select 1 from public.events e
    where e.id = event_id
      and (
        e.status = 'aprovado'
        or public.is_admin()
        or public.is_organizer_of_event(e.id)
      )
  )
);

drop policy if exists event_images_manage_owner_or_admin on public.event_images;
create policy event_images_manage_owner_or_admin
on public.event_images for all
using (
  public.is_admin()
  or exists (
    select 1 from public.events e
    where e.id = event_id and public.is_organizer_of_event(e.id)
  )
)
with check (
  public.is_admin()
  or exists (
    select 1 from public.events e
    where e.id = event_id and public.is_organizer_of_event(e.id)
  )
);

drop policy if exists event_attractions_select_for_visible_events on public.event_attractions;
create policy event_attractions_select_for_visible_events
on public.event_attractions for select
using (
  exists (
    select 1 from public.events e
    where e.id = event_id
      and (
        e.status = 'aprovado'
        or public.is_admin()
        or public.is_organizer_of_event(e.id)
      )
  )
);

drop policy if exists event_attractions_manage_owner_or_admin on public.event_attractions;
create policy event_attractions_manage_owner_or_admin
on public.event_attractions for all
using (
  public.is_admin()
  or exists (
    select 1 from public.events e
    where e.id = event_id and public.is_organizer_of_event(e.id)
  )
)
with check (
  public.is_admin()
  or exists (
    select 1 from public.events e
    where e.id = event_id and public.is_organizer_of_event(e.id)
  )
);

drop policy if exists reviews_select_for_visible_events on public.reviews;
create policy reviews_select_for_visible_events
on public.reviews for select
using (
  exists (
    select 1 from public.events e
    where e.id = event_id and e.status = 'aprovado'
  )
  or public.is_admin()
  or user_id = auth.uid()
);

drop policy if exists reviews_insert_owner_on_approved_events on public.reviews;
create policy reviews_insert_owner_on_approved_events
on public.reviews for insert
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.events e
    where e.id = event_id and e.status = 'aprovado'
  )
);

drop policy if exists reviews_update_delete_owner_or_admin on public.reviews;
create policy reviews_update_delete_owner_or_admin
on public.reviews for all
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists event_comments_select_for_visible_events on public.event_comments;
create policy event_comments_select_for_visible_events
on public.event_comments for select
using (
  exists (
    select 1 from public.events e
    where e.id = event_id and e.status = 'aprovado'
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
    select 1 from public.events e
    where e.id = event_id and e.status = 'aprovado'
  )
);

drop policy if exists event_comments_delete_owner_or_admin on public.event_comments;
create policy event_comments_delete_owner_or_admin
on public.event_comments for delete
using (user_id = auth.uid() or public.is_admin());

drop policy if exists saved_events_owner_only on public.saved_events;
create policy saved_events_owner_only
on public.saved_events for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists notifications_select_owner_or_admin on public.notifications;
create policy notifications_select_owner_or_admin
on public.notifications for select
using (user_id = auth.uid() or public.is_admin());

drop policy if exists notifications_insert_admin_only on public.notifications;
create policy notifications_insert_admin_only
on public.notifications for insert
with check (public.is_admin());

drop policy if exists notifications_update_owner_or_admin on public.notifications;
create policy notifications_update_owner_or_admin
on public.notifications for update
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

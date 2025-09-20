-- Minimal registration storage setup: profiles + user_progression (no drops, safe to run multiple times)
-- This script does NOT remove existing triggers. It only creates missing tables and helpers.

-- 1) profiles table (basic user info)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles disable row level security;

grant all on public.profiles to anon;
grant all on public.profiles to authenticated;
grant all on public.profiles to service_role;

-- Optional but useful index
create index if not exists idx_profiles_email on public.profiles (email);

-- 2) user_progression table (used by initialize_user_progression trigger/function)
create table if not exists public.user_progression (
  user_id uuid primary key references auth.users(id) on delete cascade,
  level int not null default 1,
  experience int not null default 0,
  max_experience int not null default 1000,
  coins int not null default 0,
  last_xp_gain timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_progression disable row level security;

grant all on public.user_progression to anon;
grant all on public.user_progression to authenticated;
grant all on public.user_progression to service_role;

-- 3) RPC to create/update profile manually from the app (optional helper)
create or replace function public.create_or_update_profile(
  p_id uuid,
  p_email text,
  p_name text default null,
  p_phone text default null
)
returns uuid
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, email, name, phone, created_at, updated_at)
  values (p_id, p_email, p_name, p_phone, now(), now())
  on conflict (id) do update set
    email = excluded.email,
    name = excluded.name,
    phone = excluded.phone,
    updated_at = now();

  return p_id;
end;
$$;

grant execute on function public.create_or_update_profile(uuid, text, text, text) to anon, authenticated;

-- 4) Backfill helpers (safe, optional)
-- Initialize user_progression for any existing users that don't have a row yet
insert into public.user_progression (user_id)
select u.id from auth.users u
left join public.user_progression up on up.user_id = u.id
where up.user_id is null;

-- Ensure profiles have a row for existing users (only if you want)
-- insert into public.profiles (id, email, name)
-- select u.id, coalesce(u.email, ''), coalesce(u.raw_user_meta_data->>'name', 'User')
-- from auth.users u
-- left join public.profiles p on p.id = u.id
-- where p.id is null;

-- 5) Status
select '✅ Registration storage ready (profiles + user_progression)' as status,
       (select count(*) from public.profiles) as profiles_count,
       (select count(*) from public.user_progression) as user_progression_count;

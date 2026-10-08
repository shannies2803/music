-- The Theory Room: database set-up.
-- In Supabase: SQL Editor → New query → paste all of this → Run. Safe to run again.

-- One row per family account. Only the payment webhook (service key) changes the plan columns.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  plan text,                          -- 'monthly' | 'yearly' | null
  pro_until timestamptz,              -- Family plan is open until this time
  packs jsonb not null default '{}',  -- grade packs: {"g5": "2027-10-08T…"} = Grade 5 open until then
  ls_customer_id text,
  ls_subscription_id text,
  created_at timestamptz not null default now()
);

-- Up to 3 learners per family (first name or nickname only).
create table if not exists public.learners (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  created_at timestamptz not null default now()
);
create index if not exists learners_user on public.learners (user_id);

-- Each learner's progress in each room, saved as one JSON document per room.
create table if not exists public.progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  learner_id uuid not null references public.learners (id) on delete cascade,
  path text not null,
  data jsonb,
  updated_at timestamptz not null default now(),
  primary key (learner_id, path)
);

-- Saved exam programmes from the repertoire room (one document per family).
create table if not exists public.programmes (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb,
  updated_at timestamptz not null default now()
);

-- Make a profile when someone first signs in.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email) on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- No more than 3 learners per family.
create or replace function public.limit_learners() returns trigger
language plpgsql as $$
begin
  if (select count(*) from public.learners where user_id = new.user_id) >= 3 then
    raise exception 'A family plan has room for 3 learners.';
  end if;
  return new;
end $$;
drop trigger if exists learners_limit on public.learners;
create trigger learners_limit before insert on public.learners
  for each row execute function public.limit_learners();

-- Row level security: each family sees and changes only its own rows.
alter table public.profiles enable row level security;
alter table public.learners enable row level security;
alter table public.progress enable row level security;
alter table public.programmes enable row level security;

drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles for select using (auth.uid() = id);
-- (no insert/update policy: plan columns are written only by the webhook with the service key)

drop policy if exists "own learners" on public.learners;
create policy "own learners" on public.learners for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own progress" on public.progress;
create policy "own progress" on public.progress for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id and exists (select 1 from public.learners l where l.id = learner_id and l.user_id = auth.uid()));

-- Saving programmes across devices is a Family plan feature.
drop policy if exists "own programmes" on public.programmes;
create policy "own programmes" on public.programmes for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id and exists (select 1 from public.profiles p where p.id = auth.uid() and p.pro_until > now()));

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

-- ============ Teachers and classes ============
-- A teacher licence opens the class view, and every learner in the teacher's classes gets the
-- theory and aural rooms while the licence is active (up to teacher_seats learners in all).
alter table public.profiles add column if not exists teacher_until timestamptz;
alter table public.profiles add column if not exists teacher_seats int not null default 15;

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  code text not null unique,
  created_at timestamptz not null default now()
);
create table if not exists public.class_members (
  class_id uuid not null references public.classes (id) on delete cascade,
  learner_id uuid not null references public.learners (id) on delete cascade,
  family_id uuid not null references auth.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (class_id, learner_id)
);
alter table public.classes enable row level security;
alter table public.class_members enable row level security;
drop policy if exists "teacher reads own classes" on public.classes;
create policy "teacher reads own classes" on public.classes for select using (auth.uid() = teacher_id);
drop policy if exists "family reads own memberships" on public.class_members;
create policy "family reads own memberships" on public.class_members for select using (auth.uid() = family_id);
-- Everything else goes through the functions below, which check who is asking.

create or replace function public.create_class(p_name text) returns public.classes
language plpgsql security definer set search_path = public as $$
declare c public.classes; v_code text;
begin
  if not exists (select 1 from profiles where id = auth.uid() and teacher_until > now()) then
    raise exception 'A teacher licence is needed to make a class.';
  end if;
  loop
    v_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    exit when not exists (select 1 from classes where code = v_code);
  end loop;
  insert into classes (teacher_id, name, code) values (auth.uid(), trim(p_name), v_code) returning * into c;
  return c;
end $$;

create or replace function public.teacher_classes()
returns table (id uuid, name text, code text, members int, seats_used int, seats int, until timestamptz)
language sql security definer set search_path = public stable as $$
  select c.id, c.name, c.code,
    (select count(*)::int from class_members m where m.class_id = c.id),
    (select count(*)::int from class_members m join classes k on k.id = m.class_id where k.teacher_id = auth.uid()),
    p.teacher_seats, p.teacher_until
  from classes c join profiles p on p.id = c.teacher_id
  where c.teacher_id = auth.uid() order by c.created_at;
$$;

create or replace function public.class_roster(p_class uuid)
returns table (learner_id uuid, name text, joined_at timestamptz, progress jsonb)
language sql security definer set search_path = public stable as $$
  select m.learner_id, l.name, m.joined_at,
    coalesce((select jsonb_agg(jsonb_build_object('path', pr.path, 'data', pr.data, 'updated_at', pr.updated_at))
              from progress pr where pr.learner_id = m.learner_id), '[]'::jsonb)
  from class_members m join learners l on l.id = m.learner_id join classes c on c.id = m.class_id
  where m.class_id = p_class and c.teacher_id = auth.uid()
  order by l.name;
$$;

create or replace function public.join_class(p_code text, p_learner uuid) returns text
language plpgsql security definer set search_path = public as $$
declare c record; used int;
begin
  if not exists (select 1 from learners where id = p_learner and user_id = auth.uid()) then
    raise exception 'That learner isn''t on your account.';
  end if;
  select cl.id, cl.name, cl.teacher_id, p.teacher_until, p.teacher_seats into c
    from classes cl join profiles p on p.id = cl.teacher_id where cl.code = upper(trim(p_code));
  if not found then raise exception 'No class has that code. Check it with your teacher.'; end if;
  if c.teacher_until is null or c.teacher_until < now() then raise exception 'This class isn''t open right now. Ask your teacher.'; end if;
  select count(*) into used from class_members m join classes k on k.id = m.class_id where k.teacher_id = c.teacher_id;
  if used >= c.teacher_seats and not exists (select 1 from class_members where class_id = c.id and learner_id = p_learner) then
    raise exception 'This class is full. Ask your teacher.';
  end if;
  insert into class_members (class_id, learner_id, family_id) values (c.id, p_learner, auth.uid()) on conflict do nothing;
  return c.name;
end $$;

create or replace function public.leave_class(p_class uuid, p_learner uuid) returns void
language sql security definer set search_path = public as $$
  delete from class_members m
  where m.class_id = p_class and m.learner_id = p_learner
    and (m.family_id = auth.uid() or exists (select 1 from classes c where c.id = p_class and c.teacher_id = auth.uid()));
$$;

-- For a family: each learner's classes, and until when the teacher's licence covers them.
create or replace function public.my_classes()
returns table (learner_id uuid, class_id uuid, class_name text, until timestamptz)
language sql security definer set search_path = public stable as $$
  select m.learner_id, c.id, c.name, p.teacher_until
  from class_members m join classes c on c.id = m.class_id join profiles p on p.id = c.teacher_id
  where m.family_id = auth.uid();
$$;

revoke execute on function public.create_class(text), public.teacher_classes(), public.class_roster(uuid),
  public.join_class(text, uuid), public.leave_class(uuid, uuid), public.my_classes() from public, anon;
grant execute on function public.create_class(text), public.teacher_classes(), public.class_roster(uuid),
  public.join_class(text, uuid), public.leave_class(uuid, uuid), public.my_classes() to authenticated;

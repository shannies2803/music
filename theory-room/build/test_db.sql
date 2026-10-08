-- Runs supabase/schema.sql against a plain Postgres made to look like Supabase, then checks
-- that each family and teacher sees only what they should. Used by build/test_db.sh.
\set ON_ERROR_STOP on
create role anon nologin; create role authenticated nologin;
create schema auth;
create table auth.users (id uuid primary key, email text);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;

\i ../supabase/schema.sql
-- run it twice: the set-up must be safe to run again
\i ../supabase/schema.sql
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;

-- people: two families, one teacher (ids are fixed so the checks can name them)
insert into auth.users values ('aaaaaaaa-0000-0000-0000-000000000001', 'fam1@example.com'), ('aaaaaaaa-0000-0000-0000-000000000002', 'fam2@example.com'), ('bbbbbbbb-0000-0000-0000-000000000001', 'teacher@example.com');
do $$ begin assert (select count(*) from public.profiles) = 3, 'profiles made on sign-up'; end $$;
update public.profiles set teacher_until = now() + interval '1 year', teacher_seats = 2 where id = 'bbbbbbbb-0000-0000-0000-000000000001';

create function pg_temp.as_user(u uuid) returns void language plpgsql as $$ begin perform set_config('request.jwt.claim.sub', u::text, false); end $$;
create table pg_temp.ids (k text primary key, v uuid);
grant all on pg_temp.ids to authenticated;

-- family 1 adds learners and progress
set role authenticated;
select pg_temp.as_user('aaaaaaaa-0000-0000-0000-000000000001');
insert into public.learners (user_id, name) values ('aaaaaaaa-0000-0000-0000-000000000001', 'Mei'), ('aaaaaaaa-0000-0000-0000-000000000001', 'Kai'), ('aaaaaaaa-0000-0000-0000-000000000001', 'Lin');
insert into pg_temp.ids select 'mei', id from public.learners where name = 'Mei';
insert into pg_temp.ids select 'kai', id from public.learners where name = 'Kai';
do $$ begin
  begin insert into public.learners (user_id, name) values (auth.uid(), 'Fourth'); assert false, 'a 4th learner was allowed';
  exception when raise_exception then null; end;
end $$;
insert into public.progress (user_id, learner_id, path, data) select auth.uid(), v, 'progress/g1-5', '{"done":{"s01":"2027-01-01"}}' from pg_temp.ids where k = 'mei';
-- a family can't give itself a plan
update public.profiles set pro_until = now() + interval '10 years' where id = auth.uid();
do $$ begin assert (select pro_until from public.profiles where id = auth.uid()) is null, 'family changed its own plan'; end $$;
-- saving programmes needs the Family plan
do $$ begin
  begin insert into public.programmes (user_id, data) values (auth.uid(), '{}'); assert false, 'programme saved without a plan';
  exception when insufficient_privilege then null; end;
end $$;

-- family 2 can't see or touch family 1
select pg_temp.as_user('aaaaaaaa-0000-0000-0000-000000000002');
do $$ begin
  assert (select count(*) from public.learners) = 0, 'family 2 sees family 1 learners';
  assert (select count(*) from public.progress) = 0, 'family 2 sees family 1 progress';
  assert (select count(*) from public.profiles) = 1, 'family 2 sees other profiles';
end $$;
do $$ begin
  begin insert into public.progress (user_id, learner_id, path, data) select auth.uid(), v, 'x', '{}' from pg_temp.ids where k = 'mei'; assert false, 'wrote into another family''s learner';
  exception when insufficient_privilege then null; end;
end $$;

-- the teacher makes a class
select pg_temp.as_user('bbbbbbbb-0000-0000-0000-000000000001');
insert into pg_temp.ids select 'class', (public.create_class('Tuesday group')).id;
do $$ begin assert (select count(*) from public.teacher_classes()) = 1, 'teacher sees the class'; end $$;
do $$ begin assert (select count(*) from public.class_roster((select v from pg_temp.ids where k = 'class'))) = 0, 'empty roster'; end $$;

-- family 1 joins two learners; family 2 can't use family 1's learner
select pg_temp.as_user('aaaaaaaa-0000-0000-0000-000000000001');
do $$ declare code text; begin
  select c.code into code from public.classes c;  -- RLS: families can't list classes
  assert code is null, 'family can list classes';
end $$;
reset role;
select code as class_code from public.classes \gset
set role authenticated;
select pg_temp.as_user('aaaaaaaa-0000-0000-0000-000000000001');
select public.join_class(lower(:'class_code'), (select v from pg_temp.ids where k = 'mei')) as joined;
select public.join_class(:'class_code', (select v from pg_temp.ids where k = 'kai')) as joined;
do $$ begin assert (select count(*) from public.my_classes()) = 2, 'family sees both memberships'; end $$;
select pg_temp.as_user('aaaaaaaa-0000-0000-0000-000000000002');
do $$ begin
  begin perform public.join_class('XXXXXX', (select v from pg_temp.ids where k = 'mei')); assert false, 'joined with another family''s learner';
  exception when raise_exception then null; end;
end $$;
insert into public.learners (user_id, name) values (auth.uid(), 'Zoe');
-- the licence has 2 places, both used
do $$ begin
  begin perform public.join_class((select code from public.teacher_classes() limit 1), (select id from public.learners where name = 'Zoe')); assert false;
  exception when raise_exception then null; when others then null; end;
end $$;
reset role;
do $$ begin assert (select count(*) from public.class_members) = 2, 'a third learner got into a 2-place class'; end $$;
set role authenticated;

-- the teacher sees names and progress for the class, and only for the class
select pg_temp.as_user('bbbbbbbb-0000-0000-0000-000000000001');
do $$ declare r record; begin
  assert (select count(*) from public.class_roster((select v from pg_temp.ids where k = 'class'))) = 2, 'roster has 2';
  select * into r from public.class_roster((select v from pg_temp.ids where k = 'class')) where name = 'Mei';
  assert jsonb_array_length(r.progress) = 1, 'teacher sees Mei''s progress';
  assert (select count(*) from public.learners) = 0, 'teacher can read learners table directly';
  assert (select count(*) from public.progress) = 0, 'teacher can read progress table directly';
end $$;
-- another teacher (family 2, no licence) sees nothing of it
select pg_temp.as_user('aaaaaaaa-0000-0000-0000-000000000002');
do $$ begin
  assert (select count(*) from public.class_roster((select v from pg_temp.ids where k = 'class'))) = 0, 'outsider read the roster';
  begin perform public.create_class('Mine'); assert false, 'made a class without a licence';
  exception when raise_exception then null; end;
end $$;

-- the teacher removes Kai; family 1 removes Mei
select pg_temp.as_user('bbbbbbbb-0000-0000-0000-000000000001');
select public.leave_class((select v from pg_temp.ids where k = 'class'), (select v from pg_temp.ids where k = 'kai'));
select pg_temp.as_user('aaaaaaaa-0000-0000-0000-000000000001');
select public.leave_class((select v from pg_temp.ids where k = 'class'), (select v from pg_temp.ids where k = 'mei'));
reset role;
do $$ begin assert (select count(*) from public.class_members) = 0, 'leaving didn''t work'; end $$;
\echo ALL DATABASE CHECKS PASSED

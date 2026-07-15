-- Multiple language solutions per question. Exactly one solution per
-- question may be marked primary; two triggers below enforce this without
-- requiring the frontend to orchestrate multi-row updates.

create table public.question_solutions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,

  language text not null check (language in (
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C', 'C++', 'C#', 'Go', 'Rust'
  )),
  code text,
  approach text,
  intuition text,
  solution_explanation text,
  time_complexity text,
  space_complexity text,
  is_primary boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.question_solutions is 'One row per language solution attached to a question.';

create trigger trg_solutions_updated_at
  before update on public.question_solutions
  for each row execute function public.set_updated_at();

-- If this is the first solution saved for a question, force it to be primary
-- regardless of what the client sent, so a question is never left without
-- a primary solution.
create or replace function public.default_primary_if_first()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1 from public.question_solutions where question_id = new.question_id
  ) then
    new.is_primary := true;
  end if;
  return new;
end;
$$;

create trigger trg_default_primary_solution
  before insert on public.question_solutions
  for each row execute function public.default_primary_if_first();

-- Whenever a solution is marked primary, unset any other primary solution
-- for the same question. Runs before insert/update so the unique partial
-- index below never sees a conflict.
create or replace function public.enforce_single_primary_solution()
returns trigger
language plpgsql
as $$
begin
  if new.is_primary then
    update public.question_solutions
    set is_primary = false
    where question_id = new.question_id
      and id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
      and is_primary = true;
  end if;
  return new;
end;
$$;

create trigger trg_single_primary_solution
  before insert or update of is_primary on public.question_solutions
  for each row when (new.is_primary)
  execute function public.enforce_single_primary_solution();

-- Belt-and-suspenders: even with the triggers above, guarantee at the
-- constraint level that a question can never end up with two primaries.
create unique index uq_solutions_single_primary
  on public.question_solutions (question_id)
  where is_primary = true;

create index idx_solutions_question_language
  on public.question_solutions (question_id, language);

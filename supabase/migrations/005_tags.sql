-- Tags are per-user (unlike topics), so two users can each have their own
-- "Must Revise" tag without collision.

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (btrim(name) <> ''),
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

comment on table public.tags is 'Per-user custom labels (Interview, Google, Tricky, ...).';

create table public.question_tags (
  question_id uuid not null references public.questions(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (question_id, tag_id)
);

comment on table public.question_tags is 'Many-to-many link between questions and tags.';

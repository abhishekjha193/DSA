-- Every revision attempt is an append-only history record. Summary fields
-- (revision_count, last_revised_at, next_revision_at) live on questions and
-- are maintained by the record_revision() function in 010_functions.sql —
-- never written to directly by the frontend.

create table public.question_revisions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,

  revised_at timestamptz not null default now(),
  confidence_before text check (confidence_before in ('Low', 'Medium', 'High')),
  confidence_after text check (confidence_after in ('Low', 'Medium', 'High')),
  result text not null check (result in (
    'Failed', 'Struggled', 'Solved With Hint', 'Solved', 'Easy Recall'
  )),
  revision_notes text,
  time_taken_minutes integer check (time_taken_minutes is null or time_taken_minutes >= 0),

  created_at timestamptz not null default now()
);

comment on table public.question_revisions is 'Append-only revision attempt history, one row per attempt.';

create index idx_revisions_question_revised_at
  on public.question_revisions (question_id, revised_at desc);

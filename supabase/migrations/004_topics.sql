-- Topics are a shared reference taxonomy (not per-user) so the same
-- "Dynamic Programming" topic can be reused across every user's questions
-- without duplicating rows. See 011_seed_topics.sql for the default set.

create table public.topics (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

comment on table public.topics is 'Shared DSA topic taxonomy (Arrays, Graphs, DP, ...).';

create table public.question_topics (
  question_id uuid not null references public.questions(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  primary key (question_id, topic_id)
);

comment on table public.question_topics is 'Many-to-many link between questions and topics.';

create index idx_question_topics_topic_question
  on public.question_topics (topic_id, question_id);

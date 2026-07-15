-- Core questions table. Every user-owned row carries user_id and is
-- protected by RLS policies added in 009_rls.sql.

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  title text not null check (btrim(title) <> ''),
  slug text not null,
  description text,

  difficulty text not null check (difficulty in ('Easy', 'Medium', 'Hard')),
  platform text not null check (platform in (
    'LeetCode', 'GeeksForGeeks', 'HackerRank', 'Coding Ninjas',
    'Codeforces', 'InterviewBit', 'Custom', 'Other'
  )),
  problem_url text,

  status text not null default 'Not Started' check (status in (
    'Not Started', 'Attempted', 'Solved', 'Revision Needed', 'Mastered'
  )),
  confidence_level text check (confidence_level in ('Low', 'Medium', 'High')),

  is_solved boolean not null default false,
  is_favorite boolean not null default false,
  is_bookmarked boolean not null default false,
  revision_required boolean not null default false,
  revision_count integer not null default 0 check (revision_count >= 0),

  notes text,

  last_revised_at timestamptz,
  next_revision_at timestamptz,
  solved_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Generated dedup keys. Immutable helper functions make these valid here.
  normalized_title text generated always as (lower(btrim(title))) stored,
  normalized_url text generated always as (public.normalize_url(problem_url)) stored,

  -- Full text search vector: title weighted highest, platform as a secondary signal.
  search_vector tsvector generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(platform, '')), 'B')
  ) stored
);

comment on table public.questions is 'One row per DSA problem saved by a user.';

-- Duplicate prevention at the database level (never rely on frontend checks alone).
-- Platform questions are deduped by normalized problem URL; questions without a
-- URL (custom/manual entries) are deduped by normalized title.
create unique index uq_questions_platform_url
  on public.questions (user_id, platform, normalized_url)
  where normalized_url is not null;

create unique index uq_questions_custom_title
  on public.questions (user_id, normalized_title)
  where normalized_url is null;

create trigger trg_questions_updated_at
  before update on public.questions
  for each row execute function public.set_updated_at();

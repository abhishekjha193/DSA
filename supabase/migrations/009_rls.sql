-- Row Level Security. Every user-owned table is locked down so a user can
-- only ever see or modify their own rows. Ownership checks always use
-- auth.uid() — the browser-supplied user_id on an insert/update payload is
-- never trusted; the WITH CHECK clauses below re-verify it server-side.

-- questions ------------------------------------------------------------
alter table public.questions enable row level security;

create policy "questions_select_own" on public.questions
  for select using (auth.uid() = user_id);

create policy "questions_insert_own" on public.questions
  for insert with check (auth.uid() = user_id);

create policy "questions_update_own" on public.questions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "questions_delete_own" on public.questions
  for delete using (auth.uid() = user_id);

-- question_solutions -----------------------------------------------------
alter table public.question_solutions enable row level security;

create policy "solutions_select_own" on public.question_solutions
  for select using (auth.uid() = user_id);

create policy "solutions_insert_own" on public.question_solutions
  for insert with check (
    auth.uid() = user_id
    and exists (select 1 from public.questions q where q.id = question_id and q.user_id = auth.uid())
  );

create policy "solutions_update_own" on public.question_solutions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "solutions_delete_own" on public.question_solutions
  for delete using (auth.uid() = user_id);

-- topics (shared reference data) ----------------------------------------
alter table public.topics enable row level security;

create policy "topics_select_authenticated" on public.topics
  for select using (auth.role() = 'authenticated');

-- Users may add a new shared topic (e.g. via bulk import) but never
-- update or delete one, since it may be referenced by other users' data.
create policy "topics_insert_authenticated" on public.topics
  for insert with check (auth.role() = 'authenticated');

-- question_topics ---------------------------------------------------------
alter table public.question_topics enable row level security;

create policy "question_topics_select" on public.question_topics
  for select using (
    exists (select 1 from public.questions q where q.id = question_id and q.user_id = auth.uid())
  );

create policy "question_topics_insert" on public.question_topics
  for insert with check (
    exists (select 1 from public.questions q where q.id = question_id and q.user_id = auth.uid())
  );

create policy "question_topics_delete" on public.question_topics
  for delete using (
    exists (select 1 from public.questions q where q.id = question_id and q.user_id = auth.uid())
  );

-- tags --------------------------------------------------------------------
alter table public.tags enable row level security;

create policy "tags_select_own" on public.tags
  for select using (auth.uid() = user_id);

create policy "tags_insert_own" on public.tags
  for insert with check (auth.uid() = user_id);

create policy "tags_update_own" on public.tags
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "tags_delete_own" on public.tags
  for delete using (auth.uid() = user_id);

-- question_tags -------------------------------------------------------------
alter table public.question_tags enable row level security;

create policy "question_tags_select" on public.question_tags
  for select using (
    exists (select 1 from public.questions q where q.id = question_id and q.user_id = auth.uid())
  );

create policy "question_tags_insert" on public.question_tags
  for insert with check (
    exists (select 1 from public.questions q where q.id = question_id and q.user_id = auth.uid())
    and exists (select 1 from public.tags t where t.id = tag_id and t.user_id = auth.uid())
  );

create policy "question_tags_delete" on public.question_tags
  for delete using (
    exists (select 1 from public.questions q where q.id = question_id and q.user_id = auth.uid())
  );

-- question_revisions ---------------------------------------------------------
alter table public.question_revisions enable row level security;

create policy "revisions_select_own" on public.question_revisions
  for select using (auth.uid() = user_id);

create policy "revisions_insert_own" on public.question_revisions
  for insert with check (
    auth.uid() = user_id
    and exists (select 1 from public.questions q where q.id = question_id and q.user_id = auth.uid())
  );

-- Revision history is append-only by design — no update/delete policy is
-- created, so history can never be edited or erased after the fact.

-- user_settings ------------------------------------------------------------
alter table public.user_settings enable row level security;

create policy "settings_select_own" on public.user_settings
  for select using (auth.uid() = user_id);

create policy "settings_insert_own" on public.user_settings
  for insert with check (auth.uid() = user_id);

create policy "settings_update_own" on public.user_settings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

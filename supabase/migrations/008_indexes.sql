-- Query-pattern-driven indexes. Every index here maps to a real access
-- pattern from the Questions page filters, the dashboard, or revisions —
-- we deliberately do not index every column.

-- Questions page default sort ("newest first") and pagination.
create index idx_questions_user_created_at
  on public.questions (user_id, created_at desc);

-- Difficulty filter chip / dashboard "questions by difficulty" breakdown.
create index idx_questions_user_difficulty
  on public.questions (user_id, difficulty);

-- Platform filter chip / dashboard "questions by platform" breakdown.
create index idx_questions_user_platform
  on public.questions (user_id, platform);

-- Status filter chip and the "Not Started / Solved / Mastered" dashboard tiles.
create index idx_questions_user_status
  on public.questions (user_id, status);

-- Confidence filter chip used alongside revision planning.
create index idx_questions_user_confidence
  on public.questions (user_id, confidence_level);

-- Revisions page: "Due Today" / "Overdue" / "Upcoming" all filter and sort
-- on this column together, so it is the single most important index for
-- the revision system's read performance.
create index idx_questions_user_next_revision
  on public.questions (user_id, next_revision_at);

-- Full text search on title/platform (see search_vector on questions).
create index idx_questions_search_vector
  on public.questions using gin (search_vector);

-- Boolean filters (favorite / bookmarked / revision required) are combined
-- with other filters and have low cardinality, so a single partial index
-- on the "true" rows is cheaper than three full-column indexes.
create index idx_questions_favorite on public.questions (user_id) where is_favorite;
create index idx_questions_bookmarked on public.questions (user_id) where is_bookmarked;
create index idx_questions_revision_required on public.questions (user_id) where revision_required;

-- Tag list / tag filter lookups scoped to the current user.
create index idx_tags_user on public.tags (user_id);

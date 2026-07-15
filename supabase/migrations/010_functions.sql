-- =========================================================================
-- Spaced revision scheduling
-- =========================================================================
-- Single source of truth for revision intervals. Never duplicate this
-- logic in React — components call record_revision() and read back
-- whatever the database decided.
--
-- Base schedule (days after N successful revisions): 1, 3, 7, 14, 30.
-- Beyond stage 5 the interval keeps growing (x1.5 per stage) so a
-- well-known problem drifts further apart instead of capping at 30 days.
--
-- Result adjustments:
--   Failed            -> step back one stage, half the (shorter) interval
--   Struggled         -> same stage, 75% of the interval
--   Solved With Hint  -> advance one stage, full interval
--   Solved            -> advance one stage, full interval
--   Easy Recall       -> advance two stages, full interval (rewards strong recall)
-- A question is marked Mastered once it advances 3+ stages past the base
-- schedule with a non-struggling result.

create or replace function public.compute_next_interval_days(p_stage integer, p_result text)
returns table (
  new_stage integer,
  interval_days integer,
  revision_required boolean,
  new_status text
)
language plpgsql
immutable
as $$
declare
  base_intervals integer[] := array[1, 3, 7, 14, 30];
  base_len integer := 5;
  target_stage integer;
  base_days integer;
begin
  if p_result not in ('Failed', 'Struggled', 'Solved With Hint', 'Solved', 'Easy Recall') then
    raise exception 'Unknown revision result: %', p_result;
  end if;

  case p_result
    when 'Failed' then
      target_stage := greatest(p_stage - 1, 0);
    when 'Struggled' then
      target_stage := p_stage;
    when 'Easy Recall' then
      target_stage := p_stage + 2;
    else
      target_stage := p_stage + 1;
  end case;

  base_days := case
    when target_stage <= 0 then base_intervals[1]
    when target_stage <= base_len then base_intervals[target_stage]
    else round(base_intervals[base_len] * power(1.5, target_stage - base_len))::integer
  end;

  interval_days := case p_result
    when 'Failed' then greatest(1, floor(base_days * 0.5)::integer)
    when 'Struggled' then greatest(1, floor(base_days * 0.75)::integer)
    else base_days
  end;

  new_stage := target_stage;
  revision_required := true;
  new_status := case
    when p_result in ('Failed', 'Struggled') then 'Revision Needed'
    when target_stage > base_len + 3 then 'Mastered'
    else 'Solved'
  end;

  if new_status = 'Mastered' then
    revision_required := false;
  end if;

  return next;
end;
$$;

comment on function public.compute_next_interval_days is
  'Pure scheduling calculation. Change the spaced-repetition algorithm here only.';

-- Records one revision attempt and applies its effect to the parent
-- question atomically. SECURITY DEFINER + explicit ownership check means
-- this works even if a caller's RLS context is unusual, while still
-- refusing to touch a question that is not theirs.
create or replace function public.record_revision(
  p_question_id uuid,
  p_result text,
  p_confidence_before text default null,
  p_confidence_after text default null,
  p_revision_notes text default null,
  p_time_taken_minutes integer default null
)
returns public.question_revisions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_question public.questions;
  v_calc record;
  v_revision public.question_revisions;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_question
  from public.questions
  where id = p_question_id and user_id = v_user_id
  for update;

  if not found then
    raise exception 'Question not found or access denied';
  end if;

  select * into v_calc from public.compute_next_interval_days(v_question.revision_count, p_result);

  insert into public.question_revisions (
    user_id, question_id, revised_at, confidence_before, confidence_after,
    result, revision_notes, time_taken_minutes
  ) values (
    v_user_id, p_question_id, now(), p_confidence_before, p_confidence_after,
    p_result, p_revision_notes, p_time_taken_minutes
  ) returning * into v_revision;

  update public.questions
  set revision_count = v_calc.new_stage,
      last_revised_at = now(),
      next_revision_at = now() + (v_calc.interval_days || ' days')::interval,
      revision_required = v_calc.revision_required,
      status = v_calc.new_status,
      confidence_level = coalesce(p_confidence_after, confidence_level),
      updated_at = now()
  where id = p_question_id;

  return v_revision;
end;
$$;

-- =========================================================================
-- Dashboard aggregate statistics
-- =========================================================================
-- All aggregation happens here so the frontend never fetches full question
-- rows just to count them. SECURITY INVOKER (the default) is intentional:
-- these run as the calling user so RLS still applies as defense in depth,
-- in addition to the explicit user_id = auth.uid() filters below.

create or replace function public.get_dashboard_stats()
returns json
language sql
stable
set search_path = public
as $$
  select json_build_object(
    'total_questions', count(*),
    'solved', count(*) filter (where status = 'Solved'),
    'attempted', count(*) filter (where status = 'Attempted'),
    'not_started', count(*) filter (where status = 'Not Started'),
    'mastered', count(*) filter (where status = 'Mastered'),
    'revision_needed', count(*) filter (where status = 'Revision Needed'),
    'easy', count(*) filter (where difficulty = 'Easy'),
    'medium', count(*) filter (where difficulty = 'Medium'),
    'hard', count(*) filter (where difficulty = 'Hard'),
    'revision_due_today', count(*) filter (
      where next_revision_at is not null and next_revision_at::date = current_date
    ),
    'overdue_revisions', count(*) filter (
      where next_revision_at is not null and next_revision_at < now()
    ),
    'favorites', count(*) filter (where is_favorite),
    'total_revision_sessions', (
      select count(*) from public.question_revisions where user_id = auth.uid()
    )
  )
  from public.questions
  where user_id = auth.uid();
$$;

create or replace function public.get_difficulty_stats()
returns table (difficulty text, count bigint)
language sql
stable
set search_path = public
as $$
  select difficulty, count(*)
  from public.questions
  where user_id = auth.uid()
  group by difficulty
  order by difficulty;
$$;

create or replace function public.get_platform_stats()
returns table (platform text, count bigint)
language sql
stable
set search_path = public
as $$
  select platform, count(*)
  from public.questions
  where user_id = auth.uid()
  group by platform
  order by count(*) desc;
$$;

create or replace function public.get_topic_stats()
returns table (topic text, count bigint)
language sql
stable
set search_path = public
as $$
  select t.name, count(*)
  from public.question_topics qt
  join public.topics t on t.id = qt.topic_id
  join public.questions q on q.id = qt.question_id
  where q.user_id = auth.uid()
  group by t.name
  order by count(*) desc
  limit 15;
$$;

create or replace function public.get_language_stats()
returns table (language text, count bigint)
language sql
stable
set search_path = public
as $$
  select s.language, count(*)
  from public.question_solutions s
  join public.questions q on q.id = s.question_id
  where q.user_id = auth.uid()
  group by s.language
  order by count(*) desc;
$$;

-- =========================================================================
-- Search
-- =========================================================================
-- Combines full text search on title/platform with a plain match on topic
-- and tag names, all scoped to the caller. Frontend debounces calls to
-- this by ~400ms (see hooks/useDebounce.js) rather than the database
-- doing any rate limiting itself.

create or replace function public.search_questions(p_query text, p_limit integer default 25, p_offset integer default 0)
returns setof public.questions
language sql
stable
set search_path = public
as $$
  select distinct q.*
  from public.questions q
  left join public.question_topics qt on qt.question_id = q.id
  left join public.topics t on t.id = qt.topic_id
  left join public.question_tags qtag on qtag.question_id = q.id
  left join public.tags tg on tg.id = qtag.tag_id
  where q.user_id = auth.uid()
    and (
      p_query is null or p_query = ''
      or q.search_vector @@ plainto_tsquery('english', p_query)
      or t.name ilike '%' || p_query || '%'
      or tg.name ilike '%' || p_query || '%'
    )
  order by q.created_at desc
  limit p_limit offset p_offset;
$$;

-- =========================================================================
-- Bulk import
-- =========================================================================
-- Accepts a jsonb array (one call per batch — the frontend chunks a
-- 2,000+ row CSV/JSON import into batches of ~200 rather than issuing
-- one request per row). Runs as a single statement per batch so a batch
-- either fully applies or, on a hard error outside the per-item handler,
-- rolls back as one unit.

create or replace function public.bulk_import_questions(p_items jsonb)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_item jsonb;
  v_title text;
  v_platform text;
  v_url text;
  v_question_id uuid;
  v_topic_name text;
  v_topic_id uuid;
  v_success integer := 0;
  v_failed integer := 0;
  v_skipped integer := 0;
  v_errors jsonb := '[]'::jsonb;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    begin
      v_title := btrim(coalesce(v_item->>'title', ''));
      v_platform := coalesce(nullif(btrim(v_item->>'platform'), ''), 'Other');
      v_url := nullif(btrim(v_item->>'problem_url'), '');

      if v_title = '' then
        v_failed := v_failed + 1;
        v_errors := v_errors || jsonb_build_object('item', v_item, 'error', 'Missing title');
        continue;
      end if;

      if v_platform not in (
        'LeetCode', 'GeeksForGeeks', 'HackerRank', 'Coding Ninjas',
        'Codeforces', 'InterviewBit', 'Custom', 'Other'
      ) then
        v_platform := 'Other';
      end if;

      insert into public.questions (
        user_id, title, slug, difficulty, platform, problem_url, status, description
      ) values (
        v_user_id,
        v_title,
        public.slugify(v_title),
        case
          when upper(coalesce(v_item->>'difficulty', '')) in ('EASY') then 'Easy'
          when upper(coalesce(v_item->>'difficulty', '')) in ('HARD') then 'Hard'
          else 'Medium'
        end,
        v_platform,
        v_url,
        case
          when v_item->>'status' in ('Not Started', 'Attempted', 'Solved', 'Revision Needed', 'Mastered')
            then v_item->>'status'
          else 'Not Started'
        end,
        nullif(v_item->>'description', '')
      )
      returning id into v_question_id;

      if coalesce(v_item->>'code', '') <> '' or coalesce(v_item->>'language', '') <> '' then
        insert into public.question_solutions (
          user_id, question_id, language, code, approach, time_complexity, space_complexity
        ) values (
          v_user_id,
          v_question_id,
          case
            when coalesce(v_item->>'language', '') in (
              'JavaScript', 'TypeScript', 'Python', 'Java', 'C', 'C++', 'C#', 'Go', 'Rust'
            ) then v_item->>'language'
            else 'JavaScript'
          end,
          nullif(v_item->>'code', ''),
          nullif(v_item->>'approach', ''),
          nullif(v_item->>'time_complexity', ''),
          nullif(v_item->>'space_complexity', '')
        );
      end if;

      if jsonb_typeof(v_item->'topics') = 'array' then
        for v_topic_name in select jsonb_array_elements_text(v_item->'topics')
        loop
          v_topic_name := btrim(v_topic_name);
          continue when v_topic_name = '';

          insert into public.topics (name, slug)
          values (v_topic_name, public.slugify(v_topic_name))
          on conflict (name) do nothing;

          select id into v_topic_id from public.topics where name = v_topic_name;

          if v_topic_id is not null then
            insert into public.question_topics (question_id, topic_id)
            values (v_question_id, v_topic_id)
            on conflict do nothing;
          end if;
        end loop;
      end if;

      v_success := v_success + 1;
    exception
      when unique_violation then
        v_skipped := v_skipped + 1;
      when others then
        v_failed := v_failed + 1;
        v_errors := v_errors || jsonb_build_object('item', v_item, 'error', sqlerrm);
    end;
  end loop;

  return jsonb_build_object(
    'success', v_success,
    'failed', v_failed,
    'skipped_duplicates', v_skipped,
    'errors', v_errors
  );
end;
$$;

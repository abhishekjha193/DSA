import { supabase } from '../lib/supabase'

// Columns selected for the Questions list view. Deliberately excludes
// `description`/`notes` (large text) and never joins solution code — those
// are only fetched when a single question is opened (see getQuestionById).
const LIST_COLUMNS =
  'id, title, slug, difficulty, platform, status, confidence_level, is_favorite, is_bookmarked, revision_required, revision_count, next_revision_at, created_at'

/**
 * Server-side paginated + filtered question list.
 * @param {object} params
 * @param {number} params.page - 1-indexed page number
 * @param {number} params.pageSize
 * @param {object} params.filters - { difficulty, platform, topicId, language, status, confidence, solved, favorite, bookmarked, revisionRequired }
 * @param {string} params.sort - column name to order by
 * @param {boolean} params.ascending
 */
export async function getQuestions({
  page = 1,
  pageSize = 25,
  filters = {},
  sort = 'created_at',
  ascending = false,
} = {}) {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  // Filtering by topic or language requires an inner join, which changes
  // the base query shape, so it's built conditionally rather than always
  // joining tables the page doesn't need.
  const selectParts = [LIST_COLUMNS]
  if (filters.topicId) selectParts.push('question_topics!inner(topic_id)')
  if (filters.language) selectParts.push('question_solutions!inner(language)')

  let query = supabase.from('questions').select(selectParts.join(', '), { count: 'exact' })

  if (filters.difficulty) query = query.eq('difficulty', filters.difficulty)
  if (filters.platform) query = query.eq('platform', filters.platform)
  if (filters.status) query = query.eq('status', filters.status)
  if (filters.confidence) query = query.eq('confidence_level', filters.confidence)
  if (filters.solved) query = query.eq('status', 'Solved')
  if (filters.favorite) query = query.eq('is_favorite', true)
  if (filters.bookmarked) query = query.eq('is_bookmarked', true)
  if (filters.revisionRequired) query = query.eq('revision_required', true)
  if (filters.topicId) query = query.eq('question_topics.topic_id', filters.topicId)
  if (filters.language) query = query.eq('question_solutions.language', filters.language)

  query = query.order(sort, { ascending }).range(from, to)

  const { data, error, count } = await query
  if (error) throw error

  return {
    questions: data ?? [],
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
  }
}

/** Full question detail including topics/tags, but NOT solutions (fetched separately). */
export async function getQuestionById(id) {
  const { data, error } = await supabase
    .from('questions')
    .select(
      `*, question_topics(topic:topics(id, name, slug)), question_tags(tag:tags(id, name))`
    )
    .eq('id', id)
    .single()

  if (error) throw error

  return {
    ...data,
    topics: (data.question_topics ?? []).map((t) => t.topic),
    tags: (data.question_tags ?? []).map((t) => t.tag),
  }
}

export async function createQuestion(payload) {
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError

  const { topicIds = [], tagIds = [], ...fields } = payload

  const { data, error } = await supabase
    .from('questions')
    .insert({ ...fields, user_id: userData.user.id })
    .select()
    .single()

  if (error) throw error

  if (topicIds.length) {
    await setQuestionTopics(data.id, topicIds)
  }
  if (tagIds.length) {
    await setQuestionTags(data.id, tagIds)
  }

  return data
}

export async function updateQuestion(id, payload) {
  const { topicIds, tagIds, ...fields } = payload

  const { data, error } = await supabase
    .from('questions')
    .update(fields)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  if (topicIds !== undefined) {
    await setQuestionTopics(id, topicIds)
  }
  if (tagIds !== undefined) {
    await setQuestionTags(id, tagIds)
  }

  return data
}

/** Cascades to solutions, revisions, topic/tag links via ON DELETE CASCADE. */
export async function deleteQuestion(id) {
  const { error } = await supabase.from('questions').delete().eq('id', id)
  if (error) throw error
}

export async function toggleFavorite(id, isFavorite) {
  const { error } = await supabase
    .from('questions')
    .update({ is_favorite: isFavorite })
    .eq('id', id)
  if (error) throw error
}

export async function toggleBookmark(id, isBookmarked) {
  const { error } = await supabase
    .from('questions')
    .update({ is_bookmarked: isBookmarked })
    .eq('id', id)
  if (error) throw error
}

export async function updateQuestionStatus(id, status) {
  const patch = { status }
  if (status === 'Solved' || status === 'Mastered') {
    patch.solved_at = new Date().toISOString()
    patch.is_solved = true
  }
  if (status === 'Revision Needed') {
    // The Revisions page (Due Today / Overdue) only surfaces questions
    // where revision_required is true AND next_revision_at is set — so
    // manually flagging a question this way must set both, not just the
    // status label, or it silently disappears everywhere else in the app.
    patch.revision_required = true
    patch.next_revision_at = new Date().toISOString()
  }
  const { error } = await supabase.from('questions').update(patch).eq('id', id)
  if (error) throw error
}

async function setQuestionTopics(questionId, topicIds) {
  await supabase.from('question_topics').delete().eq('question_id', questionId)
  if (!topicIds.length) return
  const { error } = await supabase
    .from('question_topics')
    .insert(topicIds.map((topic_id) => ({ question_id: questionId, topic_id })))
  if (error) throw error
}

async function setQuestionTags(questionId, tagIds) {
  await supabase.from('question_tags').delete().eq('question_id', questionId)
  if (!tagIds.length) return
  const { error } = await supabase
    .from('question_tags')
    .insert(tagIds.map((tag_id) => ({ question_id: questionId, tag_id })))
  if (error) throw error
}

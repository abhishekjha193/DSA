import { supabase } from '../lib/supabase'

const REVISION_COLUMNS =
  'id, title, slug, difficulty, platform, status, confidence_level, revision_count, next_revision_at, last_revised_at'

/** Questions due today or already overdue, overdue first. */
export async function getDueRevisions() {
  const nowIso = new Date().toISOString()
  const { data, error } = await supabase
    .from('questions')
    .select(REVISION_COLUMNS)
    .eq('revision_required', true)
    .not('next_revision_at', 'is', null)
    .lte('next_revision_at', nowIso)
    .order('next_revision_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function getOverdueRevisions() {
  const nowIso = new Date().toISOString()
  const { data, error } = await supabase
    .from('questions')
    .select(REVISION_COLUMNS)
    .eq('revision_required', true)
    .not('next_revision_at', 'is', null)
    .lt('next_revision_at', nowIso)
    .order('next_revision_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function getUpcomingRevisions(days = 7) {
  const now = new Date()
  const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
  const { data, error } = await supabase
    .from('questions')
    .select(REVISION_COLUMNS)
    .eq('revision_required', true)
    .gt('next_revision_at', now.toISOString())
    .lte('next_revision_at', future.toISOString())
    .order('next_revision_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function getRecentlyRevised(limit = 10) {
  const { data, error } = await supabase
    .from('questions')
    .select(REVISION_COLUMNS)
    .not('last_revised_at', 'is', null)
    .order('last_revised_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data ?? []
}

export async function getRevisionHistory(questionId) {
  const { data, error } = await supabase
    .from('question_revisions')
    .select('*')
    .eq('question_id', questionId)
    .order('revised_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

/**
 * Records a revision attempt via the record_revision() RPC. The database
 * owns all scheduling logic (see migration 010_functions.sql) — this
 * function never computes intervals itself.
 */
export async function recordRevision(questionId, { result, confidenceBefore, confidenceAfter, notes, timeTakenMinutes }) {
  const { data, error } = await supabase.rpc('record_revision', {
    p_question_id: questionId,
    p_result: result,
    p_confidence_before: confidenceBefore ?? null,
    p_confidence_after: confidenceAfter ?? null,
    p_revision_notes: notes ?? null,
    p_time_taken_minutes: timeTakenMinutes ?? null,
  })

  if (error) throw error
  return data
}

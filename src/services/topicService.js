import { supabase } from '../lib/supabase'

export async function getTopics() {
  const { data, error } = await supabase.from('topics').select('id, name, slug').order('name')
  if (error) throw error
  return data ?? []
}

export async function getQuestionTopics(questionId) {
  const { data, error } = await supabase
    .from('question_topics')
    .select('topic:topics(id, name, slug)')
    .eq('question_id', questionId)

  if (error) throw error
  return (data ?? []).map((row) => row.topic)
}

export async function setQuestionTopics(questionId, topicIds) {
  await supabase.from('question_topics').delete().eq('question_id', questionId)
  if (!topicIds.length) return
  const { error } = await supabase
    .from('question_topics')
    .insert(topicIds.map((topic_id) => ({ question_id: questionId, topic_id })))
  if (error) throw error
}

/** Creates a topic if it doesn't already exist (shared pool, unique by name). */
export async function findOrCreateTopic(name) {
  const trimmed = name.trim()
  const { data: existing } = await supabase
    .from('topics')
    .select('id, name, slug')
    .ilike('name', trimmed)
    .maybeSingle()

  if (existing) return existing

  const slug = trimmed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  const { data, error } = await supabase
    .from('topics')
    .insert({ name: trimmed, slug })
    .select('id, name, slug')
    .single()

  if (error) throw error
  return data
}

import { supabase } from '../lib/supabase'

export async function getTags() {
  const { data, error } = await supabase.from('tags').select('id, name').order('name')
  if (error) throw error
  return data ?? []
}

export async function createTag(name) {
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError

  const { data, error } = await supabase
    .from('tags')
    .insert({ name: name.trim(), user_id: userData.user.id })
    .select('id, name')
    .single()

  if (error) throw error
  return data
}

/** Finds an existing tag by name (case-insensitive) or creates a new one. */
export async function findOrCreateTag(name) {
  const trimmed = name.trim()
  const { data: existing } = await supabase
    .from('tags')
    .select('id, name')
    .ilike('name', trimmed)
    .maybeSingle()

  if (existing) return existing
  return createTag(trimmed)
}

export async function deleteTag(id) {
  const { error } = await supabase.from('tags').delete().eq('id', id)
  if (error) throw error
}

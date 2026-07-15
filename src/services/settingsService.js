import { supabase } from '../lib/supabase'

const DEFAULTS = {
  default_language: 'JavaScript',
  code_editor_theme: 'vs-dark',
  default_question_view: 'table',
}

/** Returns the user's settings row, creating one with defaults if it doesn't exist yet. */
export async function getSettings() {
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError

  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userData.user.id)
    .maybeSingle()

  if (error) throw error
  if (data) return data

  const { data: created, error: createError } = await supabase
    .from('user_settings')
    .insert({ user_id: userData.user.id, ...DEFAULTS })
    .select()
    .single()

  if (createError) throw createError
  return created
}

export async function updateSettings(patch) {
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError

  const { data, error } = await supabase
    .from('user_settings')
    .update(patch)
    .eq('user_id', userData.user.id)
    .select()
    .single()

  if (error) throw error
  return data
}

/** Convenience accessor used when creating a new solution. */
export async function getDefaultLanguage() {
  const settings = await getSettings()
  return settings.default_language
}

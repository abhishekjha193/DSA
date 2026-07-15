import { supabase } from '../lib/supabase'

export async function getSolutions(questionId) {
  const { data, error } = await supabase
    .from('question_solutions')
    .select('*')
    .eq('question_id', questionId)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function createSolution(questionId, payload) {
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError

  const { data, error } = await supabase
    .from('question_solutions')
    .insert({ ...payload, question_id: questionId, user_id: userData.user.id })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateSolution(id, payload) {
  const { data, error } = await supabase
    .from('question_solutions')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteSolution(id) {
  const { error } = await supabase.from('question_solutions').delete().eq('id', id)
  if (error) throw error
}

/** Setting a solution primary automatically unsets the previous one (DB trigger). */
export async function setPrimarySolution(id) {
  const { error } = await supabase
    .from('question_solutions')
    .update({ is_primary: true })
    .eq('id', id)
  if (error) throw error
}

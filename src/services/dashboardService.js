import { supabase } from '../lib/supabase'

export async function getDashboardStats() {
  const { data, error } = await supabase.rpc('get_dashboard_stats')
  if (error) throw error
  return data
}

export async function getDifficultyStats() {
  const { data, error } = await supabase.rpc('get_difficulty_stats')
  if (error) throw error
  return data ?? []
}

export async function getPlatformStats() {
  const { data, error } = await supabase.rpc('get_platform_stats')
  if (error) throw error
  return data ?? []
}

export async function getTopicStats() {
  const { data, error } = await supabase.rpc('get_topic_stats')
  if (error) throw error
  return data ?? []
}

export async function getLanguageStats() {
  const { data, error } = await supabase.rpc('get_language_stats')
  if (error) throw error
  return data ?? []
}

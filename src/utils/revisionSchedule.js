// Mirrors compute_next_interval_days() in supabase/migrations/010_functions.sql.
// This copy exists purely so the Revisions UI can preview "this will push
// the next revision out ~N days" before the user submits. The database
// function is the only place that actually writes next_revision_at —
// if you change the algorithm, update both and keep them in sync.

const BASE_INTERVALS = [1, 3, 7, 14, 30]

export function previewNextInterval(currentStage, result) {
  let targetStage
  switch (result) {
    case 'Failed':
      targetStage = Math.max(currentStage - 1, 0)
      break
    case 'Struggled':
      targetStage = currentStage
      break
    case 'Easy Recall':
      targetStage = currentStage + 2
      break
    default:
      targetStage = currentStage + 1
  }

  const baseLen = BASE_INTERVALS.length
  let baseDays
  if (targetStage <= 0) baseDays = BASE_INTERVALS[0]
  else if (targetStage <= baseLen) baseDays = BASE_INTERVALS[targetStage - 1]
  else baseDays = Math.round(BASE_INTERVALS[baseLen - 1] * Math.pow(1.5, targetStage - baseLen))

  let intervalDays = baseDays
  if (result === 'Failed') intervalDays = Math.max(1, Math.floor(baseDays * 0.5))
  if (result === 'Struggled') intervalDays = Math.max(1, Math.floor(baseDays * 0.75))

  const willMaster = targetStage > baseLen + 3 && result !== 'Failed' && result !== 'Struggled'

  return { targetStage, intervalDays, willMaster }
}

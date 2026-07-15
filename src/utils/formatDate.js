export function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/** Human-friendly relative label for revision due dates: "Overdue by 2d", "Due today", "In 3d". */
export function relativeDueLabel(value) {
  if (!value) return '—'
  const now = new Date()
  const due = new Date(value)
  const diffMs = due.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0)
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Due today'
  if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)}d`
  return `In ${diffDays}d`
}

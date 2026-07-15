import { DIFFICULTY_COLOR } from '../../constants'

export function DifficultyBadge({ difficulty }) {
  const color = DIFFICULTY_COLOR[difficulty] ?? 'var(--color-text-muted)'
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium"
      style={{ color, backgroundColor: `${color}1a` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {difficulty}
    </span>
  )
}

const STATUS_STYLES = {
  'Not Started': 'text-text-muted bg-surface-2',
  Attempted: 'text-warning bg-warning-soft',
  Solved: 'text-success bg-success-soft',
  'Revision Needed': 'text-info bg-info-soft',
  Mastered: 'text-accent bg-accent-soft',
}

export function StatusBadge({ status }) {
  return (
    <span className={['inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium', STATUS_STYLES[status] ?? 'text-text-muted bg-surface-2'].join(' ')}>
      {status}
    </span>
  )
}

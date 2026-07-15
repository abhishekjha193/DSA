import { Link } from 'react-router-dom'
import { DifficultyBadge } from '../common/Badge'
import { relativeDueLabel } from '../../utils/formatDate'
import Button from '../common/Button'

export default function RevisionRow({ question, onRevise, showDue = true }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border-soft bg-surface-2 px-3 py-2.5">
      <div className="min-w-0">
        <Link to={`/questions/${question.id}`} className="block truncate text-sm font-medium text-text-primary hover:text-accent">
          {question.title}
        </Link>
        <div className="mt-1 flex items-center gap-2">
          <DifficultyBadge difficulty={question.difficulty} />
          {showDue && <span className="text-xs text-text-muted">{relativeDueLabel(question.next_revision_at)}</span>}
        </div>
      </div>
      {onRevise && (
        <Button size="sm" variant="secondary" onClick={() => onRevise(question)} className="shrink-0">
          Revise
        </Button>
      )}
    </div>
  )
}

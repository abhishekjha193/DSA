import { useNavigate } from 'react-router-dom'
import { Bookmark, RotateCw, Star } from 'lucide-react'
import { DifficultyBadge, StatusBadge } from '../common/Badge'
import { relativeDueLabel } from '../../utils/formatDate'

export default function QuestionTable({ questions, onToggleFavorite, onToggleBookmark }) {
  const navigate = useNavigate()

  return (
    <div className="overflow-x-auto rounded-t-xl border border-b-0 border-border">
      <table className="w-full min-w-[820px] text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-2 text-left text-xs uppercase tracking-wide text-text-muted">
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Difficulty</th>
            <th className="px-4 py-3 font-medium">Platform</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Confidence</th>
            <th className="px-4 py-3 font-medium">Revision</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q) => (
            <tr
              key={q.id}
              onClick={() => navigate(`/questions/${q.id}`)}
              className="cursor-pointer border-b border-border bg-surface transition-colors hover:bg-surface-2"
            >
              <td className="max-w-xs truncate px-4 py-3 font-medium text-text-primary">{q.title}</td>
              <td className="px-4 py-3"><DifficultyBadge difficulty={q.difficulty} /></td>
              <td className="px-4 py-3 text-text-secondary">{q.platform}</td>
              <td className="px-4 py-3"><StatusBadge status={q.status} /></td>
              <td className="px-4 py-3 text-text-secondary">{q.confidence_level ?? '—'}</td>
              <td className="px-4 py-3 text-text-secondary">
                {q.revision_required ? relativeDueLabel(q.next_revision_at) : '—'}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onToggleFavorite(q)}
                    className={q.is_favorite ? 'text-accent' : 'text-text-muted hover:text-text-primary'}
                    aria-label="Toggle favorite"
                  >
                    <Star size={16} fill={q.is_favorite ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={() => onToggleBookmark(q)}
                    className={q.is_bookmarked ? 'text-info' : 'text-text-muted hover:text-text-primary'}
                    aria-label="Toggle bookmark"
                  >
                    <Bookmark size={16} fill={q.is_bookmarked ? 'currentColor' : 'none'} />
                  </button>
                  {q.revision_required && (
                    <span className="text-warning" title="Revision required">
                      <RotateCw size={14} />
                    </span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

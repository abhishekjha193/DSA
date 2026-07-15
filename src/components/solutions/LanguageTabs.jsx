import { Star } from 'lucide-react'

export default function LanguageTabs({ solutions, activeId, onSelect, onAddNew }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b border-border pb-3">
      {solutions.map((s) => (
        <button
          key={s.id}
          onClick={() => onSelect(s.id)}
          className={[
            'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
            activeId === s.id
              ? 'bg-accent-soft text-accent-hover'
              : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary',
          ].join(' ')}
        >
          {s.is_primary && <Star size={12} fill="currentColor" />}
          {s.language}
        </button>
      ))}
      <button
        onClick={onAddNew}
        className="rounded-lg border border-dashed border-border px-3 py-1.5 text-sm text-text-muted hover:border-accent/40 hover:text-accent"
      >
        + Add language
      </button>
    </div>
  )
}

import { Bookmark, Filter, RotateCw, Star, X } from 'lucide-react'
import Select from '../common/Select'
import { CONFIDENCE_LEVEL, DIFFICULTY, LANGUAGES, PLATFORMS, STATUS } from '../../constants'

const TOGGLE_FILTERS = [
  { key: 'favorite', label: 'Favorite', icon: Star },
  { key: 'bookmarked', label: 'Bookmarked', icon: Bookmark },
  { key: 'revisionRequired', label: 'Revision Required', icon: RotateCw },
]

export default function FilterPanel({ filters, onChange, topics, activeCount, onClear }) {
  function set(key, value) {
    onChange({ ...filters, [key]: value || undefined })
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
          <Filter size={15} />
          Filters
          {activeCount > 0 && (
            <span className="rounded-full bg-accent-soft px-1.5 py-0.5 text-[11px] text-accent">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-xs text-text-muted hover:text-text-primary"
          >
            <X size={12} />
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Select label="Difficulty" value={filters.difficulty ?? ''} onChange={(e) => set('difficulty', e.target.value)}>
          <option value="">All</option>
          {DIFFICULTY.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </Select>

        <Select label="Platform" value={filters.platform ?? ''} onChange={(e) => set('platform', e.target.value)}>
          <option value="">All</option>
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </Select>

        <Select label="Topic" value={filters.topicId ?? ''} onChange={(e) => set('topicId', e.target.value)}>
          <option value="">All</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </Select>

        <Select label="Status" value={filters.status ?? ''} onChange={(e) => set('status', e.target.value)}>
          <option value="">All</option>
          {STATUS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>

        <Select label="Confidence" value={filters.confidence ?? ''} onChange={(e) => set('confidence', e.target.value)}>
          <option value="">All</option>
          {CONFIDENCE_LEVEL.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>

        <Select label="Language" value={filters.language ?? ''} onChange={(e) => set('language', e.target.value)}>
          <option value="">All</option>
          {LANGUAGES.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </Select>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {TOGGLE_FILTERS.map(({ key, label, icon: Icon }) => {
          const active = Boolean(filters[key])
          return (
            <button
              key={key}
              onClick={() => set(key, !active)}
              className={[
                'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                active
                  ? 'border-accent/40 bg-accent-soft text-accent-hover'
                  : 'border-border bg-surface-2 text-text-secondary hover:text-text-primary',
              ].join(' ')}
            >
              <Icon size={13} />
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

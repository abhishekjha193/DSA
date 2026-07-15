import { useMemo, useState } from 'react'
import { Plus, X } from 'lucide-react'

/**
 * options: [{ id, name }]
 * value: array of selected ids
 * onCreate: optional async (name) => { id, name } — enables free-text creation
 */
export default function MultiSelect({ label, options, value, onChange, onCreate, placeholder = 'Search…' }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)

  const selected = useMemo(
    () => options.filter((o) => value.includes(o.id)),
    [options, value]
  )

  const filtered = useMemo(() => {
    if (!query.trim()) return options.filter((o) => !value.includes(o.id)).slice(0, 8)
    const q = query.toLowerCase()
    return options.filter((o) => !value.includes(o.id) && o.name.toLowerCase().includes(q)).slice(0, 8)
  }, [options, query, value])

  const exactMatch = options.some((o) => o.name.toLowerCase() === query.trim().toLowerCase())

  function toggle(id) {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id])
  }

  async function handleCreate() {
    if (!onCreate || !query.trim() || creating) return
    setCreating(true)
    try {
      const created = await onCreate(query.trim())
      onChange([...value, created.id])
      setQuery('')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="relative">
      {label && <span className="mb-1.5 block text-sm font-medium text-text-secondary">{label}</span>}

      <div className="flex flex-wrap gap-1.5 rounded-lg border border-border bg-surface-2 p-2">
        {selected.map((item) => (
          <span
            key={item.id}
            className="flex items-center gap-1 rounded-md bg-surface-3 px-2 py-1 text-xs text-text-primary"
          >
            {item.name}
            <button type="button" onClick={() => toggle(item.id)} className="text-text-muted hover:text-danger">
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={selected.length ? '' : placeholder}
          className="min-w-[100px] flex-1 bg-transparent px-1 py-1 text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
        />
      </div>

      {open && (filtered.length > 0 || (onCreate && query.trim() && !exactMatch)) && (
        <div className="absolute z-30 mt-1 w-full rounded-lg border border-border bg-surface-2 py-1 shadow-xl">
          {filtered.map((item) => (
            <button
              key={item.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                toggle(item.id)
                setQuery('')
              }}
              className="block w-full px-3 py-1.5 text-left text-sm text-text-secondary hover:bg-surface-3 hover:text-text-primary"
            >
              {item.name}
            </button>
          ))}
          {onCreate && query.trim() && !exactMatch && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleCreate}
              disabled={creating}
              className="flex w-full items-center gap-1.5 border-t border-border px-3 py-1.5 text-left text-sm text-accent hover:bg-surface-3"
            >
              <Plus size={13} />
              {creating ? 'Creating…' : `Create "${query.trim()}"`}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

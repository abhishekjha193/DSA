import { useEffect, useState } from 'react'
import Editor from '@monaco-editor/react'
import { Star, Trash2 } from 'lucide-react'
import Select from '../common/Select'
import FormField from '../common/FormField'
import Textarea from '../common/Textarea'
import Button from '../common/Button'
import ConfirmDialog from '../common/ConfirmDialog'
import { LANGUAGES } from '../../constants'
import { toMonacoLanguage } from '../../utils/monacoLanguage'

const EMPTY = {
  language: 'JavaScript',
  code: '',
  approach: '',
  intuition: '',
  solution_explanation: '',
  time_complexity: '',
  space_complexity: '',
}

export default function SolutionEditor({ solution, availableLanguages, editorTheme = 'vs-dark', onSave, onDelete, onSetPrimary, isNew = false }) {
  const [form, setForm] = useState({ ...EMPTY, ...solution })
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Intentionally keyed on solution?.id only: switching to a different
  // solution should reset the form, but re-renders of the *same* solution
  // object (e.g. a parent state update after save) must not clobber
  // whatever the user is currently typing.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setForm({ ...EMPTY, ...solution })
  }, [solution?.id])

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      await onSave(form)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select
          className="w-48"
          value={form.language}
          onChange={update('language')}
          disabled={!isNew}
        >
          {(isNew ? availableLanguages : LANGUAGES).map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </Select>

        <div className="flex items-center gap-2">
          {!isNew && !solution.is_primary && (
            <Button variant="secondary" size="sm" onClick={() => onSetPrimary(solution.id)}>
              <Star size={13} />
              Make Primary
            </Button>
          )}
          {!isNew && (
            <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
              <Trash2 size={13} />
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <Editor
          height="360px"
          theme={editorTheme}
          language={toMonacoLanguage(form.language)}
          value={form.code}
          onChange={(value) => setForm((f) => ({ ...f, code: value ?? '' }))}
          options={{
            fontSize: 13,
            fontFamily: "'JetBrains Mono', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 12 },
            automaticLayout: true,
          }}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Time Complexity" value={form.time_complexity} onChange={update('time_complexity')} placeholder="O(n)" />
        <FormField label="Space Complexity" value={form.space_complexity} onChange={update('space_complexity')} placeholder="O(1)" />
      </div>

      <Textarea label="Approach" value={form.approach} onChange={update('approach')} rows={3} placeholder="High-level approach…" />
      <Textarea label="Intuition" value={form.intuition} onChange={update('intuition')} rows={3} placeholder="Why this approach works…" />
      <Textarea
        label="Explanation"
        value={form.solution_explanation}
        onChange={update('solution_explanation')}
        rows={4}
        placeholder="Step-by-step walkthrough…"
      />

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : isNew ? 'Add Solution' : 'Save Solution'}
        </Button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this solution?"
        description="This will permanently remove the code and notes for this language."
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false)
          onDelete(solution.id)
        }}
      />
    </div>
  )
}

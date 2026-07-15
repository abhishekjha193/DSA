import { useState } from 'react'
import { X } from 'lucide-react'
import Select from '../common/Select'
import Textarea from '../common/Textarea'
import FormField from '../common/FormField'
import Button from '../common/Button'
import { CONFIDENCE_LEVEL, REVISION_RESULT } from '../../constants'
import { previewNextInterval } from '../../utils/revisionSchedule'

export default function RevisionModal({ question, onClose, onSubmit }) {
  const [result, setResult] = useState('Solved')
  const [confidenceAfter, setConfidenceAfter] = useState(question.confidence_level ?? 'Medium')
  const [notes, setNotes] = useState('')
  const [timeTaken, setTimeTaken] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const preview = previewNextInterval(question.revision_count ?? 0, result)

  async function handleSubmit(e) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      await onSubmit({
        result,
        confidenceBefore: question.confidence_level ?? null,
        confidenceAfter,
        notes: notes || null,
        timeTakenMinutes: timeTaken ? Number(timeTaken) : null,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="font-display text-base font-semibold text-text-primary">Record Revision</h3>
            <p className="mt-0.5 text-sm text-text-secondary">{question.title}</p>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Result" value={result} onChange={(e) => setResult(e.target.value)}>
            {REVISION_RESULT.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </Select>

          <Select label="Confidence after" value={confidenceAfter} onChange={(e) => setConfidenceAfter(e.target.value)}>
            {CONFIDENCE_LEVEL.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>

          <FormField
            label="Time taken (minutes)"
            type="number"
            min="0"
            value={timeTaken}
            onChange={(e) => setTimeTaken(e.target.value)}
            placeholder="Optional"
          />

          <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Optional" />

          <div className="rounded-lg border border-border-soft bg-surface-2 px-3 py-2 text-xs text-text-secondary">
            Next revision in ~<span className="font-medium text-text-primary">{preview.intervalDays} day{preview.intervalDays === 1 ? '' : 's'}</span>
            {preview.willMaster && <span className="text-accent"> · will be marked Mastered</span>}
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Save Revision'}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

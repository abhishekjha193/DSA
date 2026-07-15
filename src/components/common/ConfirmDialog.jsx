import { AlertTriangle } from 'lucide-react'
import Button from './Button'

export default function ConfirmDialog({ open, title, description, confirmLabel = 'Delete', onConfirm, onCancel, danger = true }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-5 shadow-2xl">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger-soft text-danger">
            <AlertTriangle size={18} />
          </span>
          <div>
            <h3 className="font-display text-base font-semibold text-text-primary">{title}</h3>
            {description && <p className="mt-1 text-sm text-text-secondary">{description}</p>}
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

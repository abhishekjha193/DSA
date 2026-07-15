export default function Textarea({ label, className = '', rows = 4, ...props }) {
  return (
    <label className={['block', className].join(' ')}>
      {label && <span className="mb-1.5 block text-sm font-medium text-text-secondary">{label}</span>}
      <textarea
        rows={rows}
        className="w-full resize-y rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-accent focus:outline-none"
        {...props}
      />
    </label>
  )
}

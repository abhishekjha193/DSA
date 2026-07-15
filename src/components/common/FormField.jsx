export default function FormField({ label, error, className = '', ...inputProps }) {
  return (
    <label className={['block', className].join(' ')}>
      <span className="mb-1.5 block text-sm font-medium text-text-secondary">{label}</span>
      <input
        className={[
          'w-full rounded-lg border bg-surface-2 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted',
          'transition-colors focus:border-accent focus:outline-none',
          error ? 'border-danger' : 'border-border',
        ].join(' ')}
        {...inputProps}
      />
      {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
    </label>
  )
}

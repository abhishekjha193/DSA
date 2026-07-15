export default function Select({ label, className = '', children, ...props }) {
  return (
    <label className={['block', className].join(' ')}>
      {label && <span className="mb-1.5 block text-sm font-medium text-text-secondary">{label}</span>}
      <select
        className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text-primary transition-colors focus:border-accent focus:outline-none"
        {...props}
      >
        {children}
      </select>
    </label>
  )
}

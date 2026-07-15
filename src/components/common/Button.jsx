const VARIANTS = {
  primary:
    'bg-accent text-base hover:bg-accent-hover focus-visible:outline-accent-hover disabled:bg-accent-dim',
  secondary:
    'bg-surface-2 text-text-primary border border-border hover:bg-surface-3 disabled:opacity-50',
  ghost: 'text-text-secondary hover:bg-surface-2 hover:text-text-primary disabled:opacity-50',
  danger: 'bg-danger-soft text-danger border border-danger/30 hover:bg-danger/20 disabled:opacity-50',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
}

export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) {
  return (
    <Component
      className={[
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
        'disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </Component>
  )
}

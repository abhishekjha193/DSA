export default function Card({ className = '', children, ...props }) {
  return (
    <div
      className={['rounded-xl border border-border bg-surface', className].join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}

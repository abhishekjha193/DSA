import { NavLink } from 'react-router-dom'
import {
  Lock,
  LayoutDashboard,
  ListChecks,
  PlusCircle,
  RotateCw,
  Settings,
  UploadCloud,
  X,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/questions', label: 'Questions', icon: ListChecks },
  { to: '/questions/new', label: 'Add Question', icon: PlusCircle },
  { to: '/revisions', label: 'Revisions', icon: RotateCw },
  { to: '/import', label: 'Bulk Import', icon: UploadCloud },
  { to: '/settings', label: 'Settings', icon: Settings },
]

function NavItem({ to, label, icon: Icon, end, onNavigate }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        [
          'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
          isActive
            ? 'bg-accent-soft text-accent-hover'
            : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={[
              'absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full transition-opacity',
              isActive ? 'bg-accent opacity-100' : 'opacity-0',
            ].join(' ')}
          />
          <Icon size={18} strokeWidth={2} />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  )
}

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-surface',
          'transition-transform duration-200 lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-soft text-accent">
              <Lock size={16} strokeWidth={2.5} />
            </span>
            <span className="font-display text-[15px] font-semibold tracking-tight text-text-primary">
              DSA Vault
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-text-secondary hover:bg-surface-2 hover:text-text-primary lg:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.to} {...item} onNavigate={onClose} />
          ))}
        </nav>

        <div className="border-t border-border p-4">
          <p className="text-xs leading-relaxed text-text-muted">
            2,000+ problems, one vault. Built for systematic DSA revision.
          </p>
        </div>
      </aside>
    </>
  )
}

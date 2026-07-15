import { useState } from 'react'
import { LogOut, Menu, Search, UserCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

export default function Topbar({ onMenuClick, title, onSearchClick }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleSignOut() {
    try {
      await signOut()
      toast.success('Logged out')
      navigate('/login', { replace: true })
    } catch (err) {
      toast.error(err.message ?? 'Failed to log out')
    }
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-base/90 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-md p-1.5 text-text-secondary hover:bg-surface-2 hover:text-text-primary lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="font-display text-lg font-semibold text-text-primary">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onSearchClick}
          className="hidden items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-muted transition-colors hover:border-border-soft hover:text-text-secondary sm:flex"
        >
          <Search size={15} />
          <span>Search questions…</span>
          <kbd className="ml-6 rounded border border-border px-1.5 py-0.5 text-[10px] text-text-muted">
            /
          </kbd>
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-text-secondary hover:text-text-primary"
            aria-label="Account menu"
          >
            <UserCircle size={20} />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 z-20 mt-2 w-56 rounded-lg border border-border bg-surface-2 p-1.5 shadow-xl">
                <div className="truncate px-2.5 py-1.5 text-xs text-text-muted">{user?.email}</div>
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-text-secondary hover:bg-surface-3 hover:text-text-primary"
                >
                  <LogOut size={14} />
                  Log out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

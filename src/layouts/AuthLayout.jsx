import { Outlet } from 'react-router-dom'
import { Lock } from 'lucide-react'

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-base px-4">
      <div className="mb-8 flex items-center gap-2.5">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent">
          <Lock size={20} strokeWidth={2.5} />
        </span>
        <span className="font-display text-xl font-semibold tracking-tight text-text-primary">
          DSA Vault
        </span>
      </div>
      <div className="w-full max-w-sm">
        <Outlet />
      </div>
    </div>
  )
}

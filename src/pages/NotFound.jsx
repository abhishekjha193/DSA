import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'
import Button from '../components/common/Button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-base px-4 text-center">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-accent">
        <Lock size={22} />
      </span>
      <h1 className="font-display text-2xl font-semibold text-text-primary">Page not found</h1>
      <p className="mt-2 text-sm text-text-secondary">
        This page doesn't exist in your vault.
      </p>
      <Button as={Link} to="/" className="mt-6">
        Back to Dashboard
      </Button>
    </div>
  )
}

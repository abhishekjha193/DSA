import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Card from '../components/common/Card'
import FormField from '../components/common/FormField'
import Button from '../components/common/Button'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (submitting) return
    setError('')
    setSubmitting(true)
    try {
      await signIn(form.email, form.password)
      toast.success('Welcome back')
      navigate(location.state?.from?.pathname ?? '/', { replace: true })
    } catch (err) {
      setError(err.message ?? 'Failed to log in')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="p-6">
      <h2 className="font-display text-lg font-semibold text-text-primary">Welcome back</h2>
      <p className="mt-1 text-sm text-text-secondary">Log in to your vault.</p>

      {error && (
        <div className="mt-4 rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
          {error}
        </div>
      )}

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <FormField
          label="Email"
          type="email"
          name="email"
          placeholder="you@example.com"
          required
          value={form.email}
          onChange={update('email')}
          autoComplete="email"
        />
        <FormField
          label="Password"
          type="password"
          name="password"
          placeholder="••••••••"
          required
          value={form.password}
          onChange={update('password')}
          autoComplete="current-password"
        />
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Logging in…' : 'Log in'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-accent hover:text-accent-hover">
          Sign up
        </Link>
      </p>
    </Card>
  )
}

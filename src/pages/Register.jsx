import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Card from '../components/common/Card'
import FormField from '../components/common/FormField'
import Button from '../components/common/Button'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (submitting) return
    setError('')

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    try {
      const data = await signUp(form.email, form.password)
      if (data.session) {
        toast.success('Account created')
        navigate('/', { replace: true })
      } else {
        toast.success('Check your email to confirm your account')
        navigate('/login', { replace: true })
      }
    } catch (err) {
      setError(err.message ?? 'Failed to create account')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="p-6">
      <h2 className="font-display text-lg font-semibold text-text-primary">Create your vault</h2>
      <p className="mt-1 text-sm text-text-secondary">Start tracking your DSA practice.</p>

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
          autoComplete="new-password"
        />
        <FormField
          label="Confirm password"
          type="password"
          name="confirmPassword"
          placeholder="••••••••"
          required
          value={form.confirmPassword}
          onChange={update('confirmPassword')}
          autoComplete="new-password"
        />
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Sign up'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-accent hover:text-accent-hover">
          Log in
        </Link>
      </p>
    </Card>
  )
}

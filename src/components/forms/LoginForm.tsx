'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function LoginForm() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resetMode, setResetMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(
        error.message === 'Invalid login credentials'
          ? 'Incorrect email or password. Please try again.'
          : error.message
      )
      setLoading(false)
      return
    }

    // Update last_login_at
    await supabase
      .from('agents')
      .update({ last_login_at: new Date().toISOString() })
      .eq('email', email)

    router.push('/dashboard')
    router.refresh()
  }

  async function handlePasswordReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setResetSent(true)
    setLoading(false)
  }

  // ── Password reset sent confirmation ──
  if (resetSent) {
    return (
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-base font-medium text-dark-800 mb-2">Check your email</h3>
        <p className="text-sm text-dark-500 mb-6">
          We sent a password reset link to <strong>{email}</strong>.
          Click the link in the email to reset your password.
        </p>
        <button
          onClick={() => { setResetMode(false); setResetSent(false) }}
          className="text-sm text-gold-600 hover:underline"
        >
          Back to sign in
        </button>
      </div>
    )
  }

  // ── Password reset form ──
  if (resetMode) {
    return (
      <form onSubmit={handlePasswordReset} className="space-y-5">
        <div>
          <h3 className="text-base font-medium text-dark-800 mb-1">Reset password</h3>
          <p className="text-sm text-dark-400">
            Enter your email and we will send you a reset link.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Email address</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@topazworldgroup.com"
            required
            autoFocus
          />
        </div>

        <button
          type="submit"
          disabled={loading || !email}
          className="btn-primary w-full"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
          ) : (
            'Send reset link'
          )}
        </button>

        <button
          type="button"
          onClick={() => { setResetMode(false); setError(null) }}
          className="w-full text-sm text-dark-500 hover:text-dark-700"
        >
          Back to sign in
        </button>
      </form>
    )
  }

  // ── Main login form ──
  return (
    <form onSubmit={handleLogin} className="space-y-5">

      {error && (
        <div className="flex items-start gap-2.5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Email */}
      <div className="form-group">
        <label className="form-label">Email address</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@topazworldgroup.com"
          required
          autoComplete="email"
          autoFocus
        />
      </div>

      {/* Password */}
      <div className="form-group">
        <label className="form-label">Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Your password"
            required
            autoComplete="current-password"
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Forgot password */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => { setResetMode(true); setError(null) }}
          className="text-xs text-gold-600 hover:underline"
        >
          Forgot password?
        </button>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !email || !password}
        className={cn('btn-primary w-full', loading && 'cursor-not-allowed')}
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
        ) : (
          'Sign in'
        )}
      </button>
    </form>
  )
}

import PropTypes from 'prop-types'
import { useState } from 'react'
import { login, registerAccount } from '../services/auth.service'

function Auth({ onAuthenticated }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isRegistering = mode === 'register'

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      if (isRegistering) {
        await registerAccount({
          name: name.trim(),
          email: email.trim(),
          password,
        })
      }

      const user = await login({
        email: email.trim(),
        password,
      })

      onAuthenticated(user)
    } catch (requestError) {
      setError(requestError.message || 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const switchMode = () => {
    setMode(isRegistering ? 'login' : 'register')
    setError('')
    setPassword('')
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background px-6 py-10">
      <section className="w-full max-w-[420px] rounded-2xl border border-border bg-surface p-8 shadow-2xl shadow-black/30 sm:p-9">
        <a href="/" className="flex w-fit items-center gap-3 text-xl font-extrabold tracking-tight">
          <span className="grid size-9 place-items-center rounded-xl bg-linear-to-br from-purple-400 to-violet-700 text-white shadow-lg shadow-purple-500/20">
            S
          </span>
          <span>Smart<span className="text-brand-light">QR</span></span>
        </a>

        <div className="mb-7 mt-9">
          <h1 className="text-2xl font-bold tracking-tight">
            {isRegistering ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            {isRegistering
              ? 'Sign up to start managing your QR codes.'
              : 'Sign in to continue to your SmartQR workspace.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-3">
          {isRegistering && (
            <>
              <label htmlFor="auth-name" className="mt-2 text-xs font-semibold text-gray-300">
                Full name
              </label>
              <input
                id="auth-name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={100}
                autoComplete="name"
                required
                className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none transition placeholder:text-text-muted focus:border-brand"
              />
            </>
          )}

          <label htmlFor="auth-email" className="mt-2 text-xs font-semibold text-gray-300">
            Email address
          </label>
          <input
            id="auth-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            maxLength={255}
            autoComplete="email"
            required
            className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none transition placeholder:text-text-muted focus:border-brand"
          />

          <label htmlFor="auth-password" className="mt-2 text-xs font-semibold text-gray-300">
            Password
          </label>
          <input
            id="auth-password"
            type="password"
            placeholder={isRegistering ? 'At least 8 characters' : 'Enter your password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={isRegistering ? 8 : 1}
            maxLength={72}
            autoComplete={isRegistering ? 'new-password' : 'current-password'}
            required
            className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none transition placeholder:text-text-muted focus:border-brand"
          />

          {error && (
            <p role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs leading-relaxed text-danger">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-3 h-11 rounded-lg border border-brand bg-linear-to-r from-violet-500 to-violet-700 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/20 disabled:cursor-wait disabled:opacity-60"
          >
            {isSubmitting
              ? 'Please wait...'
              : isRegistering
                ? 'Create account'
                : 'Sign in'}
          </button>
        </form>

        <p className="mt-7 text-center text-xs text-text-muted">
          {isRegistering
            ? 'Already have an account?'
            : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={switchMode}
            className="font-bold text-brand-light hover:text-white"
          >
            {isRegistering ? 'Sign in' : 'Create account'}
          </button>
        </p>
      </section>
    </main>
  )
}

Auth.propTypes = {
  onAuthenticated: PropTypes.func.isRequired,
}
export default Auth

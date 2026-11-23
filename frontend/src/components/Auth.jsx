import PropTypes from 'prop-types'
import { useRef, useState } from 'react'
import { login, registerAccount } from '../services/auth.service'
import { Button, Card, Input } from './ui'

function Auth({ onAuthenticated }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submissionInProgress = useRef(false)

  const isRegistering = mode === 'register'

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (submissionInProgress.current) return

    setError('')
    submissionInProgress.current = true
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
      submissionInProgress.current = false
      setIsSubmitting(false)
    }
  }

  const switchMode = () => {
    if (submissionInProgress.current) return
    setMode(isRegistering ? 'login' : 'register')
    setError('')
    setPassword('')
  }

  return (
    <main className="auth-shell">
      <section className="auth-brand-panel" aria-label="SmartQR">
        <a href="/" className="auth-brand" aria-label="SmartQR home">
          <span className="auth-brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z" />
              <path d="M14 14h2v2h-2zM18 14h2M14 18h2M18 18v2" />
            </svg>
          </span>
          <span>Smart<span>QR</span></span>
        </a>

        <div className="auth-brand-copy">
          <span className="auth-brand-kicker">QR workspace</span>
          <h2>Create, manage, and understand every code.</h2>
          <p>
            One secure workspace for QR creation, downloads, bulk management,
            and scan insights.
          </p>
        </div>

        <div className="auth-brand-proof" aria-label="SmartQR capabilities">
          <span><strong>Static</strong> and dynamic codes</span>
          <span><strong>Bulk</strong> QR management</span>
          <span><strong>Live</strong> scan analytics</span>
        </div>
      </section>

      <section className="auth-form-region" aria-labelledby="auth-heading">
        <Card as="div" variant="raised" padding="lg" className="auth-card">
          <div className="auth-heading">
            <span className="auth-heading-kicker">
              {isRegistering ? 'Get started' : 'Welcome back'}
            </span>
            <h1 id="auth-heading">
              {isRegistering ? 'Create your account' : 'Sign in to SmartQR'}
            </h1>
            <p>
              {isRegistering
                ? 'Set up your workspace and start managing QR codes.'
                : 'Enter your details to continue to your workspace.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {isRegistering && (
              <Input
                id="auth-name"
                label="Full name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={100}
                autoComplete="name"
                required
              />
            )}

            <Input
              id="auth-email"
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              maxLength={255}
              autoComplete="email"
              required
            />

            <Input
              id="auth-password"
              label="Password"
              type="password"
              placeholder={isRegistering ? 'At least 8 characters' : 'Enter your password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={isRegistering ? 8 : 1}
              maxLength={72}
              autoComplete={isRegistering ? 'new-password' : 'current-password'}
              required
            />

            {error && (
              <p className="auth-form-error" role="alert">
                {error}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              className="auth-submit"
              disabled={isSubmitting}
              isLoading={isSubmitting}
              loadingLabel={isRegistering ? 'Creating account' : 'Signing in'}
            >
              {isRegistering ? 'Create account' : 'Sign in'}
            </Button>
          </form>

          <p className="auth-switch">
            {isRegistering
              ? 'Already have an account?'
              : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={switchMode}
              disabled={isSubmitting}
            >
              {isRegistering ? 'Sign in' : 'Create account'}
            </button>
          </p>
        </Card>
      </section>
    </main>
  )
}

Auth.propTypes = {
  onAuthenticated: PropTypes.func.isRequired,
}

export default Auth

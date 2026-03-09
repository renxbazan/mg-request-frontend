import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthContext'
import Card from '../components/Card'
import Button from '../components/Button'
import FormField from '../components/FormField'

export default function Login() {
  const { t } = useTranslation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, token } = useAuth()
  const navigate = useNavigate()

  if (token) return <Navigate to="/" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login({ username, password })
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('login.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-lg)',
        background: 'var(--color-bg)',
      }}
    >
      <img
        src="/logo.png"
        alt="MG Services Unlimited"
        style={{ height: 64, marginBottom: 'var(--spacing-lg)' }}
      />
      <Card style={{ maxWidth: 360, width: '100%' }}>
        <h1 style={{ marginTop: 0, marginBottom: 'var(--spacing)', fontSize: '1.5rem' }}>
          {t('login.title')}
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-lg)' }}>
          {t('login.subtitle')}
        </p>
        <form onSubmit={handleSubmit}>
          {error && (
            <div
              style={{
                color: 'var(--color-danger)',
                marginBottom: 'var(--spacing-md)',
                fontSize: 14,
              }}
            >
              {error}
            </div>
          )}
          <FormField label={t('login.username')} id="username">
            <input
              id="username"
              type="text"
              className="input"
              data-testid="login-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </FormField>
          <FormField label={t('login.password')} id="password">
            <input
              id="password"
              type="password"
              className="input"
              data-testid="login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </FormField>
          <Button type="submit" variant="primary" disabled={loading} style={{ width: '100%' }} data-testid="login-submit">
            {loading ? t('login.submitting') : t('login.submit')}
          </Button>
        </form>
      </Card>
    </div>
  )
}

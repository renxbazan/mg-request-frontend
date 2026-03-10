import { useState, useEffect } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthContext'
import './Login.css'

const USER_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const LOCK_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const EYE_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const EYE_OFF_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)

const REMEMBER_KEY = 'mg-request-remember-username'
const REMEMBER_CHECK_KEY = 'mg-request-remember-me'

export default function Login() {
  const { t } = useTranslation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, token } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const stored = localStorage.getItem(REMEMBER_CHECK_KEY)
    if (stored === 'true') {
      const savedUsername = localStorage.getItem(REMEMBER_KEY)
      if (savedUsername) {
        setUsername(savedUsername)
        setRememberMe(true)
      }
    }
  }, [])

  if (token) return <Navigate to="/" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login({ username, password })
      if (rememberMe) {
        localStorage.setItem(REMEMBER_KEY, username)
        localStorage.setItem(REMEMBER_CHECK_KEY, 'true')
      } else {
        localStorage.removeItem(REMEMBER_KEY)
        localStorage.removeItem(REMEMBER_CHECK_KEY)
      }
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('login.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">
          <img src="/mg-isotype.svg" alt="MG" className="login-title-isotype" />
          <span className="login-title-text">{t('login.titleText')}</span>
        </h1>
        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}
          <div className="login-input-group">
            <label htmlFor="username" className="sr-only">
              {t('login.username')}
            </label>
            <div className={`login-input-wrapper ${error ? 'has-error' : ''}`}>
              <span className="login-input-icon" aria-hidden="true">
                {USER_ICON}
              </span>
              <input
                id="username"
                type="text"
                className="login-input"
                placeholder={t('login.usernamePlaceholder')}
                data-testid="login-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
          </div>
          <div className="login-input-group">
            <label htmlFor="password" className="sr-only">
              {t('login.password')}
            </label>
            <div className={`login-input-wrapper ${error ? 'has-error' : ''}`}>
              <span className="login-input-icon" aria-hidden="true">
                {LOCK_ICON}
              </span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="login-input"
                placeholder={t('login.passwordPlaceholder')}
                data-testid="login-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-input-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                tabIndex={-1}
              >
                {showPassword ? EYE_OFF_ICON : EYE_ICON}
              </button>
            </div>
          </div>
          <div className="login-options">
            <label className="login-remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              {t('login.rememberMe')}
            </label>
            <Link to="/forgot-password" className="login-forgot">
              {t('login.forgotPassword')}
            </Link>
          </div>
          <button
            type="submit"
            className="login-submit"
            disabled={loading}
            data-testid="login-submit"
          >
            {loading ? t('login.submitting') : t('login.submit')}
          </button>
        </form>
      </div>
    </div>
  )
}

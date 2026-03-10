import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './Login.css'

export default function ForgotPassword() {
  const { t } = useTranslation()
  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">
          <img src="/mg-isotype.svg" alt="MG" className="login-title-isotype" />
          <span className="login-title-text">{t('login.titleText')}</span>
        </h1>
        <p className="login-subtitle" style={{ marginBottom: 4 }}>{t('login.forgotPasswordTitle')}</p>
        <p className="login-subtitle" style={{ marginBottom: 24, marginTop: 0 }}>
          {t('login.forgotPasswordMessage')}
        </p>
        <Link to="/login" className="login-submit" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', lineHeight: '48px' }}>
          {t('login.backToLogin')}
        </Link>
      </div>
    </div>
  )
}

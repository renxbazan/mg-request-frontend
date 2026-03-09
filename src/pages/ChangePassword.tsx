import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { changeMyPassword } from '../api/auth'
import { getApiErrorMessage } from '../utils/apiUtils'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Button from '../components/Button'
import FormField from '../components/FormField'

export default function ChangePassword() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (newPassword !== confirmPassword) {
      setError(t('changePassword.errorMismatch'))
      return
    }
    if (newPassword.length < 4) {
      setError(t('changePassword.errorMinLength'))
      return
    }
    setSubmitting(true)
    try {
      await changeMyPassword(currentPassword, newPassword)
      setSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (e) {
      setError(getApiErrorMessage(e, t, t('changePassword.errorGeneric')))
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div>
        <PageHeader title={t('changePassword.title')} />
        <Card style={{ maxWidth: 400 }}>
          <p style={{ color: 'var(--color-success)', margin: '0 0 var(--spacing-md)' }}>{t('changePassword.successMessage')}</p>
          <Button variant="primary" onClick={() => navigate('/')}>{t('changePassword.backToHome')}</Button>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title={t('changePassword.title')} />
      {error && <p style={{ color: 'var(--color-danger)', marginBottom: 'var(--spacing-md)' }}>{error}</p>}
      <Card style={{ maxWidth: 400 }}>
        <form onSubmit={handleSubmit}>
          <FormField label={t('changePassword.currentPassword')} required>
            <input
              type="password"
              className="input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </FormField>
          <FormField label={t('changePassword.newPassword')} required>
            <input
              type="password"
              className="input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={4}
            />
          </FormField>
          <FormField label={t('changePassword.confirmPassword')} required>
            <input
              type="password"
              className="input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </FormField>
          <div style={{ display: 'flex', gap: 'var(--spacing)' }}>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? t('common.saving') : t('changePassword.submit')}
            </Button>
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>{t('common.cancel')}</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

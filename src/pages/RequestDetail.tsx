import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import { requestsApi, requestAssignmentsApi, RequestDto, RequestStatus } from '../api/requests'
import { usersApi } from '../api/users'
import { getApiErrorMessage } from '../utils/apiUtils'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Button from '../components/Button'
import FormField from '../components/FormField'
import PriorityBadge from '../components/PriorityBadge'
import Autocomplete from '../components/Autocomplete'
import StarRating from '../components/StarRating'

const STATUS_KEYS: Record<string, string> = {
  PENDING_APPROVAL: 'requests.statusPendingApproval',
  CREATED: 'requests.statusCreated',
  ASSIGNED: 'requests.statusAssigned',
  IN_TRANSIT: 'requests.statusInTransit',
  DONE: 'requests.statusDone',
  RATED: 'requests.statusRated',
  REJECTED: 'requests.statusRejected',
}

function Badge({ statusLabel, status, priority }: { statusLabel: string; status: string; priority?: string | null }) {
  const statusClass = status === 'REJECTED' ? 'badge-danger' : status === 'RATED' || status === 'DONE' ? 'badge-success' : 'badge-primary'
  return (
    <span style={{ display: 'inline-flex', gap: 'var(--spacing)', flexWrap: 'wrap' }}>
      <span className={`badge ${statusClass}`}>{statusLabel}</span>
      {priority && <PriorityBadge priority={priority} />}
    </span>
  )
}

export default function RequestDetail() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [request, setRequest] = useState<RequestDto | null>(null)
  const [workers, setWorkers] = useState<{ id: number; username: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [assignUserId, setAssignUserId] = useState<number | ''>('')
  const [closeComment, setCloseComment] = useState('')
  const [rateValue, setRateValue] = useState(1)
  const [rateComment, setRateComment] = useState('')
  const [showAssign, setShowAssign] = useState(false)
  const [showClose, setShowClose] = useState(false)
  const [showRate, setShowRate] = useState(false)

  const requestId = id ? Number(id) : 0

  useEffect(() => {
    if (!requestId) return
    requestsApi
      .get(requestId)
      .then(setRequest)
      .catch((e) => setError(getApiErrorMessage(e, t, t('common.errorSave'))))
      .finally(() => setLoading(false))
  }, [requestId])

  useEffect(() => {
    usersApi.workers().then((list) => setWorkers(list)).catch(() => setWorkers([]))
  }, [])

  const refresh = () => {
    if (!requestId) return
    requestsApi.get(requestId).then(setRequest)
  }

  const doAction = async (fn: () => Promise<unknown>) => {
    setError('')
    setActionLoading(true)
    try {
      await fn()
      refresh()
      setShowAssign(false)
      setShowClose(false)
      setShowRate(false)
    } catch (e) {
      setError(getApiErrorMessage(e, t, t('common.errorSave')))
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return <p>{t('common.loading')}</p>
  if (error && !request) return <p style={{ color: 'var(--color-danger)' }}>{error}</p>
  if (!request) return <p>{t('requests.requestNotFound')}</p>

  const status: RequestStatus = request.requestStatus
  const statusLabel = STATUS_KEYS[status] ? t(STATUS_KEYS[status]) : status

  return (
    <div>
      <PageHeader
        title={t('requests.requestTitle', { id: request.id })}
        actions={<Button variant="ghost" onClick={() => navigate('/requests')}>← {t('requests.backToList')}</Button>}
      />
      {error && <p style={{ color: 'var(--color-danger)', marginBottom: 'var(--spacing-md)' }}>{error}</p>}

      <Card style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div style={{ display: 'flex', gap: 'var(--spacing)', flexWrap: 'wrap', alignItems: 'center', marginBottom: 'var(--spacing)' }}>
          <Badge statusLabel={statusLabel} status={status} priority={request.priority ?? undefined} />
        </div>
        <p><strong>{t('requests.description')}:</strong> {request.description}</p>
        {request.companyName != null && (
          <p><strong>{t('requests.company')}:</strong> {request.companyName}</p>
        )}
        {request.siteName != null && (
          <p><strong>{t('requests.site')}:</strong> {request.siteName}</p>
        )}
        {request.requesterName != null && (
          <p><strong>{t('requests.requester')}:</strong> {request.requesterName}</p>
        )}
        <p><strong>{t('requests.assignedStaff')}:</strong> {request.assignedStaffName ?? '-'}</p>
        <p><strong>{t('requests.priority')}:</strong> <PriorityBadge priority={request.priority} /></p>
        <p><strong>{t('requests.date')}:</strong> {request.createDate ? new Date(request.createDate).toLocaleString() : '-'}</p>
        {request.attachments != null && request.attachments.length > 0 && (
          <div style={{ marginTop: 'var(--spacing-md)' }}>
            <p><strong>{t('requests.photos')}:</strong></p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {request.attachments.map((att) => (
                att.url ? (
                  <a key={att.id} href={att.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
                    <img src={att.url} alt="" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }} />
                  </a>
                ) : null
              ))}
            </div>
          </div>
        )}
        {status === 'RATED' && request.rating != null && (
          <p><strong>{t('requests.rating')}:</strong> <StarRating value={request.rating} readOnly /></p>
        )}
      </Card>

      <h2 style={{ fontSize: '1.1rem', marginBottom: 'var(--spacing-md)' }}>{t('common.actions')}</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing)', marginBottom: 'var(--spacing-lg)' }}>
        {status === 'PENDING_APPROVAL' && (
          <>
            <Button variant="success" disabled={actionLoading} onClick={() => doAction(() => requestsApi.approve(requestId))} data-testid="request-approve">
              {t('requests.approve')}
            </Button>
            <Button variant="danger" disabled={actionLoading} onClick={() => doAction(() => requestsApi.reject(requestId))} data-testid="request-reject">
              {t('requests.reject')}
            </Button>
          </>
        )}
        {status === 'CREATED' && (
          <>
            {!showAssign ? (
              <Button variant="secondary" onClick={() => setShowAssign(true)} data-testid="request-assign">
                {t('requests.assignToStaff')}
              </Button>
            ) : (
              <Card style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing)', flexWrap: 'wrap' }}>
                <div style={{ minWidth: 220 }}>
                  <Autocomplete
                    options={workers}
                    value={assignUserId}
                    onChange={setAssignUserId}
                    getOptionLabel={(w) => w.username}
                    getOptionId={(w) => w.id}
                    filterPlaceholder={t('requests.searchWorker')}
                    selectPlaceholder={t('requests.selectWorker')}
                    required
                  />
                </div>
                <Button variant="secondary" disabled={actionLoading || assignUserId === ''} onClick={() => doAction(() => requestAssignmentsApi.assign(requestId, assignUserId as number))} data-testid="request-assign-confirm">
                  {t('requests.assign')}
                </Button>
                <Button variant="ghost" onClick={() => setShowAssign(false)}>{t('common.cancel')}</Button>
              </Card>
            )}
          </>
        )}
        {status === 'ASSIGNED' && (
          <Button variant="secondary" disabled={actionLoading} onClick={() => doAction(() => requestsApi.attend(requestId))} data-testid="request-attend">
            {t('requests.inTransit')}
          </Button>
        )}
        {status === 'IN_TRANSIT' && (
          <>
            {!showClose ? (
              <Button variant="success" onClick={() => setShowClose(true)} data-testid="request-close">
                {t('requests.closeDone')}
              </Button>
            ) : (
              <Card style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing)', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  className="input"
                  placeholder={t('requests.commentOptional')}
                  value={closeComment}
                  onChange={(e) => setCloseComment(e.target.value)}
                  style={{ minWidth: 200 }}
                  data-testid="request-close-comment"
                />
                <Button variant="success" disabled={actionLoading} onClick={() => doAction(() => requestsApi.close(requestId, closeComment || undefined))} data-testid="request-close-confirm">
                  {t('requests.close')}
                </Button>
                <Button variant="ghost" onClick={() => setShowClose(false)}>{t('common.cancel')}</Button>
              </Card>
            )}
          </>
        )}
        {status === 'DONE' && !request.canRate && (
          <span style={{ color: 'var(--color-text-muted)' }}>{t('requests.noMoreActions')}</span>
        )}
        {status === 'DONE' && request.canRate && (
          <>
            {!showRate ? (
              <Button variant="secondary" onClick={() => setShowRate(true)} data-testid="request-rate">
                {t('requests.rate')}
              </Button>
            ) : (
              <Card style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing)', flexWrap: 'wrap' }}>
                <FormField label={t('requests.rating')}>
                  <StarRating value={rateValue} onChange={setRateValue} />
                </FormField>
                <input
                  type="text"
                  className="input"
                  placeholder={t('requests.commentOptional')}
                  value={rateComment}
                  onChange={(e) => setRateComment(e.target.value)}
                  style={{ minWidth: 160 }}
                  data-testid="request-rate-comment"
                />
                <Button variant="secondary" disabled={actionLoading} onClick={() => doAction(() => requestsApi.rate(requestId, rateValue, rateComment || undefined))} data-testid="request-rate-confirm">
                  {t('requests.submitRating')}
                </Button>
                <Button variant="ghost" onClick={() => setShowRate(false)}>{t('common.cancel')}</Button>
              </Card>
            )}
          </>
        )}
        {(status === 'RATED' || status === 'REJECTED') && (
          <span style={{ color: 'var(--color-text-muted)' }}>{t('requests.noMoreActions')}</span>
        )}
      </div>

      {request.history != null && request.history.length > 0 && (
        <Card style={{ marginBottom: 'var(--spacing-lg)' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: 'var(--spacing-md)' }}>{t('requests.history')}</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {request.history.map((entry, index) => {
              const statusLabel = STATUS_KEYS[entry.requestStatus] ? t(STATUS_KEYS[entry.requestStatus]) : entry.requestStatus
              const statusClass = entry.requestStatus === 'REJECTED' ? 'badge-danger' : entry.requestStatus === 'RATED' || entry.requestStatus === 'DONE' ? 'badge-success' : 'badge-primary'
              return (
                <li
                  key={entry.id}
                  style={{
                    display: 'flex',
                    gap: 'var(--spacing)',
                    alignItems: 'flex-start',
                    padding: 'var(--spacing-md) 0',
                    borderBottom: index < request.history!.length - 1 ? '1px solid var(--color-border, #eee)' : 'none',
                  }}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: 'var(--color-primary, #333)',
                      marginTop: 6,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing)', alignItems: 'center', marginBottom: 4 }}>
                      <span className={`badge ${statusClass}`}>{statusLabel}</span>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                        {entry.createDate ? new Date(entry.createDate).toLocaleString() : '-'}
                      </span>
                      {entry.userName != null && entry.userName !== '' && (
                        <span style={{ fontSize: '0.9rem' }}>{entry.userName}</span>
                      )}
                    </div>
                    {entry.comments != null && entry.comments.trim() !== '' && (
                      <p style={{ margin: 0, fontSize: '0.95rem' }}>{entry.comments}</p>
                    )}
                    {entry.rating != null && (
                      <p style={{ margin: '4px 0 0', fontSize: '0.95rem' }}>
                        <StarRating value={entry.rating} readOnly />
                      </p>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </Card>
      )}
    </div>
  )
}

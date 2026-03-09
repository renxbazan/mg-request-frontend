import { useMemo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { requestsApi, RequestDto } from '../api/requests'
import { catalogsApi } from '../api/catalogs'
import { useAuth } from '../auth/AuthContext'
import { getApiErrorMessage } from '../utils/apiUtils'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Button from '../components/Button'
import PriorityBadge from '../components/PriorityBadge'

const STATUS_KEYS: Record<string, string> = {
  PENDING_APPROVAL: 'requests.statusPendingApproval',
  CREATED: 'requests.statusCreated',
  ASSIGNED: 'requests.statusAssigned',
  IN_TRANSIT: 'requests.statusInTransit',
  DONE: 'requests.statusDone',
  RATED: 'requests.statusRated',
  REJECTED: 'requests.statusRejected',
}

const SUPER_ADMIN_PROFILE_ID = 1
const COMPANY_ADMIN_PROFILE_ID = 3

function RequestTable({ list }: { list: RequestDto[] }) {
  const { t } = useTranslation()
  if (list.length === 0) return <Card><p style={{ margin: 0 }}>{t('requests.noItems')}</p></Card>
  return (
    <Card style={{ padding: 0, overflow: 'hidden' }}>
      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Id</th>
              <th>{t('requests.description')}</th>
              <th>{t('requests.company')}</th>
              <th>{t('requests.site')}</th>
              <th>{t('requests.requester')}</th>
              <th>{t('requests.assignedStaff')}</th>
              <th>{t('requests.status')}</th>
              <th>{t('requests.priority')}</th>
              <th>{t('requests.date')}</th>
              <th>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id} data-testid={`requests-row-${r.id}`}>
                <td>{r.id}</td>
                <td>{r.description}</td>
                <td>{r.companyName ?? '-'}</td>
                <td>{r.siteName ?? '-'}</td>
                <td>{r.requesterName ?? '-'}</td>
                <td>{r.assignedStaffName ?? '-'}</td>
                <td>{STATUS_KEYS[r.requestStatus] ? t(STATUS_KEYS[r.requestStatus]) : r.requestStatus}</td>
                <td><PriorityBadge priority={r.priority} /></td>
                <td>{r.createDate ? new Date(r.createDate).toLocaleDateString() : '-'}</td>
                <td>
                  <Link to={`/requests/${r.id}`} style={{ color: 'var(--color-secondary)', textDecoration: 'none', fontWeight: 500 }} data-testid={`requests-open-${r.id}`}>
                    {t('requests.viewActions')}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function filterRequests(
  list: RequestDto[],
  statusFilter: string,
  priorityFilter: string,
  companyFilter: string
): RequestDto[] {
  return list.filter((r) => {
    if (statusFilter !== 'all' && r.requestStatus !== statusFilter) return false
    if (priorityFilter !== 'all' && (r.priority ?? '').toUpperCase() !== priorityFilter) return false
    if (companyFilter !== 'all' && (r.companyName ?? '') !== companyFilter) return false
    return true
  })
}

export default function RequestList() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [list, setList] = useState<RequestDto[]>([])
  const [myList, setMyList] = useState<RequestDto[]>([])
  const [assignedList, setAssignedList] = useState<RequestDto[]>([])
  const [companies, setCompanies] = useState<{ id: number; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'all' | 'my' | 'assigned'>('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [companyFilter, setCompanyFilter] = useState('all')

  const isAdmin = user && (user.profileId === SUPER_ADMIN_PROFILE_ID || user.profileId === COMPANY_ADMIN_PROFILE_ID)
  const showAssignedTab = user && (user.profileId === SUPER_ADMIN_PROFILE_ID || user.employee === true)

  useEffect(() => {
    setLoading(true)
    setError('')
    if (isAdmin) {
      const promises: Promise<RequestDto[]>[] = [requestsApi.list()]
      if (showAssignedTab) promises.push(requestsApi.assigned())
      Promise.all(promises)
        .then((results) => {
          setList(results[0])
          if (showAssignedTab && results.length > 1) setAssignedList(results[1])
          else setAssignedList([])
        })
        .catch((err) => setError(getApiErrorMessage(err, t, t('common.errorSave'))))
        .finally(() => setLoading(false))
    } else {
      const promises: Promise<RequestDto[]>[] = [requestsApi.my()]
      if (showAssignedTab) promises.push(requestsApi.assigned())
      Promise.all(promises)
        .then((results) => {
          setMyList(results[0])
          setAssignedList(showAssignedTab && results.length > 1 ? results[1] : [])
        })
        .catch((err) => setError(getApiErrorMessage(err, t, t('common.errorSave'))))
        .finally(() => setLoading(false))
    }
  }, [isAdmin, showAssignedTab])

  useEffect(() => {
    if (isAdmin) {
      catalogsApi.companies().then((c) => setCompanies(c)).catch(() => setCompanies([]))
    } else {
      const names = new Set<string>()
      myList.forEach((r) => { if (r.companyName) names.add(r.companyName) })
      assignedList.forEach((r) => { if (r.companyName) names.add(r.companyName) })
      setCompanies(Array.from(names).sort().map((name, i) => ({ id: i, name })))
    }
  }, [isAdmin, myList, assignedList])

  const displayList = isAdmin
    ? (tab === 'assigned' ? assignedList : list)
    : (tab === 'assigned' ? assignedList : myList)
  const filteredList = useMemo(
    () => filterRequests(displayList, statusFilter, priorityFilter, companyFilter),
    [displayList, statusFilter, priorityFilter, companyFilter]
  )

  const FilterBar = () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing)' }}>
        <label style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>{t('requests.filterByStatus')}</label>
        <select
          className="input"
          data-testid="requests-filter-status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ width: 'auto', minWidth: 160 }}
        >
          <option value="all">{t('requests.all')}</option>
          {Object.entries(STATUS_KEYS).map(([k, v]) => (
            <option key={k} value={k}>{t(v)}</option>
          ))}
        </select>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing)' }}>
        <label style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>{t('requests.filterByPriority')}</label>
        <select
          className="input"
          data-testid="requests-filter-priority"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          style={{ width: 'auto', minWidth: 140 }}
        >
          <option value="all">{t('requests.all')}</option>
          <option value="H">{t('requests.priorityHigh')}</option>
          <option value="M">{t('requests.priorityMedium')}</option>
          <option value="L">{t('requests.priorityLow')}</option>
        </select>
      </div>
      {companies.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing)' }}>
          <label style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>{t('requests.filterByCompany')}</label>
          <select
            className="input"
            data-testid="requests-filter-company"
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            style={{ width: 'auto', minWidth: 180 }}
          >
            <option value="all">{t('requests.all')}</option>
            {companies.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  )

  if (loading) return <p>{t('requests.loading')}</p>
  if (error) return <p style={{ color: 'var(--color-danger)' }}>{error}</p>

  return (
    <div>
      <PageHeader
        title={t('requests.title')}
        actions={<Button to="/requests/new" variant="primary" data-testid="requests-new">{t('requests.newRequest')}</Button>}
      />
      <FilterBar />
      {showAssignedTab ? (
        <>
          <div
            style={{
              display: 'flex',
              gap: 'var(--spacing)',
              marginBottom: 'var(--spacing-md)',
              borderBottom: '1px solid #eee',
            }}
          >
            <button
              type="button"
              onClick={() => setTab(isAdmin ? 'all' : 'my')}
              data-testid={isAdmin ? 'requests-tab-all' : 'requests-tab-my'}
              style={{
                padding: '10px 16px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontWeight: tab === (isAdmin ? 'all' : 'my') ? 600 : 400,
                color: tab === (isAdmin ? 'all' : 'my') ? 'var(--color-primary)' : 'var(--color-text-muted)',
                borderBottom: tab === (isAdmin ? 'all' : 'my') ? '2px solid var(--color-primary)' : '2px solid transparent',
                marginBottom: -1,
              }}
            >
              {isAdmin ? t('requests.allRequests') : t('requests.myRequests')}
            </button>
            <button
              type="button"
              onClick={() => setTab('assigned')}
              data-testid="requests-tab-assigned"
              style={{
                padding: '10px 16px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontWeight: tab === 'assigned' ? 600 : 400,
                color: tab === 'assigned' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                borderBottom: tab === 'assigned' ? '2px solid var(--color-primary)' : '2px solid transparent',
                marginBottom: -1,
              }}
            >
              {t('requests.assignedToMe')}
            </button>
          </div>
          <RequestTable list={filteredList} />
        </>
      ) : (
        <RequestTable list={filteredList} />
      )}
    </div>
  )
}

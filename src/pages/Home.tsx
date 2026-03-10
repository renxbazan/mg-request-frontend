import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthContext'
import { dashboardApi, type DashboardStats } from '../api/dashboard'
import Card from '../components/Card'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const SUPER_ADMIN_PROFILE_ID = 1
const COMPANY_ADMIN_PROFILE_ID = 3
const WORKER_PROFILE_ID = 4

const DATE_RANGES = [
  { value: 'this_month', key: 'dashboard.thisMonth' },
  { value: 'last_month', key: 'dashboard.lastMonth' },
  { value: 'last_3_months', key: 'dashboard.last3Months' },
  { value: 'last_6_months', key: 'dashboard.last6Months' },
  { value: 'this_year', key: 'dashboard.thisYear' },
  { value: 'last_year', key: 'dashboard.lastYear' },
  { value: 'all', key: 'dashboard.all' },
] as const

const STATUS_KEYS: Record<string, string> = {
  PENDING_APPROVAL: 'requests.statusPendingApproval',
  CREATED: 'requests.statusCreated',
  ASSIGNED: 'requests.statusAssigned',
  IN_TRANSIT: 'requests.statusInTransit',
  DONE: 'requests.statusDone',
  RATED: 'requests.statusRated',
  REJECTED: 'requests.statusRejected',
}

const PRIORITY_KEYS: Record<string, string> = {
  L: 'requests.priorityLow',
  M: 'requests.priorityMedium',
  H: 'requests.priorityHigh',
}

// Paleta derivada del design system (index.css)
const CHART_COLORS = [
  '#10326a', // primary
  '#61a1d9', // secondary
  '#27ae60', // success
  '#2c5f7c', // primary variant
  '#4a8fc9', // secondary-hover
  '#1e4a7a', // primary tint
  '#c0392b', // danger (para Rechazada)
]

export default function Home() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [dateRange, setDateRange] = useState('this_month')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      setStats(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    dashboardApi
      .stats(dateRange)
      .then(setStats)
      .catch((e) => setError(e?.message || t('common.errorSave')))
      .finally(() => setLoading(false))
  }, [user, dateRange, t])

  const showRatingsChart = user && (user.profileId === SUPER_ADMIN_PROFILE_ID || user.profileId === WORKER_PROFILE_ID)
  const showByCompany = user && (user.profileId === SUPER_ADMIN_PROFILE_ID || user.profileId === COMPANY_ADMIN_PROFILE_ID)

  const statusEntries = stats?.byStatus ? Object.entries(stats.byStatus).filter(([, v]) => v > 0) : []
  const statusTotal = statusEntries.reduce((s, [, v]) => s + v, 0)
  const statusData = statusEntries.map(([k, v]) => ({
    name: t(STATUS_KEYS[k] || k),
    value: v,
    key: k,
    percent: statusTotal ? ((v / statusTotal) * 100).toFixed(0) : '0',
  }))

  const priorityEntries = stats?.byPriority
    ? Object.entries(stats.byPriority).filter(([k, v]) => v > 0 && k !== 'unknown' && k !== 'UNKNOWN')
    : []
  const priorityTotal = priorityEntries.reduce((s, [, v]) => s + v, 0)
  const priorityData = priorityEntries.map(([k, v]) => ({
    name: t(PRIORITY_KEYS[k] || k),
    value: v,
    key: k,
    percent: priorityTotal ? ((v / priorityTotal) * 100).toFixed(0) : '0',
  }))

  const ratingsData = stats?.ratingsByWorker ?? []
  const byCompanyData = stats?.byCompany ?? []
  const hasAnyData =
    statusData.length > 0 ||
    priorityData.length > 0 ||
    ratingsData.length > 0 ||
    byCompanyData.length > 0

  return (
    <div>
      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h1 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--color-primary)' }}>
          {t('home.welcome', { username: user?.username ?? '' })}
        </h1>
        <p style={{ margin: 'var(--spacing) 0 0', color: 'var(--color-text-muted)' }}>{t('home.subtitle')}</p>
      </div>

      <div style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
        <Link
          to="/requests"
          data-testid="home-link-/requests"
          style={{ display: 'inline-flex', alignItems: 'center', padding: '10px 16px', background: 'var(--color-primary)', color: 'var(--color-white)', borderRadius: 'var(--radius)', textDecoration: 'none', fontWeight: 500, fontSize: 14 }}
        >
          {t('home.viewRequests')}
        </Link>
        <Link
          to="/requests/new"
          data-testid="home-link-/requests/new"
          style={{ display: 'inline-flex', alignItems: 'center', padding: '10px 16px', background: 'var(--color-secondary)', color: 'var(--color-white)', borderRadius: 'var(--radius)', textDecoration: 'none', fontWeight: 500, fontSize: 14 }}
        >
          {t('home.newRequest')}
        </Link>
      </div>

      <div style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
        <label htmlFor="dashboard-date-range" style={{ fontWeight: 500 }}>
          {t('dashboard.dateRange')}
        </label>
        <select
          id="dashboard-date-range"
          className="input"
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          style={{ maxWidth: 220 }}
        >
          {DATE_RANGES.map((r) => (
            <option key={r.value} value={r.value}>
              {t(r.key)}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>{t('common.loading')}</p>}
      {error && <p style={{ color: 'var(--color-danger)' }}>{error}</p>}

      {!loading && !error && !hasAnyData && (
        <Card>
          <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>{t('dashboard.noData')}</p>
        </Card>
      )}

      {!loading && !error && hasAnyData && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
            gap: 'var(--spacing-lg)',
          }}
        >
          {statusData.length > 0 && (
            <Card style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.06))', minWidth: 320, overflow: 'visible' }}>
              <h2 style={{ fontSize: '1.1rem', margin: '0 0 var(--spacing-md)' }}>{t('dashboard.byStatus')}</h2>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={200}>
                  <PieChart margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={80}
                      paddingAngle={2}
                      stroke="#fff"
                      strokeWidth={1.5}
                    >
                      {statusData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [value, t('dashboard.count')]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '10px 20px',
                  justifyContent: 'center',
                  paddingTop: 12,
                  borderTop: '1px solid #eee',
                  marginTop: 8,
                }}
              >
                {statusData.map((item, i) => (
                  <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ color: 'var(--color-text)' }}>
                      {item.name} {item.percent}%
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {priorityData.length > 0 && (
            <Card style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.06))', minWidth: 320, overflow: 'visible' }}>
              <h2 style={{ fontSize: '1.1rem', margin: '0 0 var(--spacing-md)' }}>{t('dashboard.byPriority')}</h2>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={200}>
                  <PieChart margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
                    <Pie
                      data={priorityData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={80}
                      paddingAngle={2}
                      stroke="#fff"
                      strokeWidth={1.5}
                    >
                      {priorityData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [value, t('dashboard.count')]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '10px 20px',
                  justifyContent: 'center',
                  paddingTop: 12,
                  borderTop: '1px solid #eee',
                  marginTop: 8,
                }}
              >
                {priorityData.map((item, i) => (
                  <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ color: 'var(--color-text)' }}>
                      {item.name} {item.percent}%
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {showRatingsChart && ratingsData.length > 0 && (
            <Card style={{ gridColumn: statusData.length === 0 && priorityData.length === 0 ? '1 / -1' : undefined }}>
              <h2 style={{ fontSize: '1.1rem', margin: '0 0 var(--spacing-md)' }}>
                {t('dashboard.ratingsByWorker')}
              </h2>
              <div style={{ height: Math.max(280, ratingsData.length * 48) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={ratingsData.map((w) => ({ ...w, name: w.workerName }))}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: number, _: unknown, props: { payload: { avgRating: number } }) => [
                        `${value} (avg: ${props.payload.avgRating})`,
                        t('dashboard.ratedRequests'),
                      ]}
                    />
                    <Bar dataKey="count" fill="#10326a" name={t('dashboard.ratedRequests')} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {showRatingsChart && ratingsData.length === 0 && statusData.length > 0 && (
            <Card>
              <h2 style={{ fontSize: '1.1rem', margin: '0 0 var(--spacing-md)' }}>
                {t('dashboard.ratingsByWorker')}
              </h2>
              <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>{t('dashboard.noRatings')}</p>
            </Card>
          )}

          {showByCompany && byCompanyData.length > 0 && (
            <Card style={{ gridColumn: '1 / -1' }}>
              <h2 style={{ fontSize: '1.1rem', margin: '0 0 var(--spacing-md)' }}>
                {t('dashboard.byCompanyAndSite')}
              </h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: 500, fontSize: 14 }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                      <th style={{ padding: '10px 12px' }}>{t('dashboard.company')}</th>
                      <th style={{ padding: '10px 12px' }}>{t('dashboard.site')}</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right' }}>{t('dashboard.total')}</th>
                      {Object.keys(STATUS_KEYS).map((k) => (
                        <th key={k} style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 500 }}>
                          {t(STATUS_KEYS[k])}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {byCompanyData.flatMap((company) =>
                      company.sites.map((site, siteIdx) => (
                        <tr
                          key={`${company.companyId}-${site.siteId}`}
                          style={{
                            borderBottom: '1px solid #eee',
                            background: siteIdx === 0 ? 'rgba(16, 50, 106, 0.03)' : undefined,
                          }}
                        >
                          {siteIdx === 0 ? (
                            <td
                              style={{ padding: '10px 12px', fontWeight: 600 }}
                              rowSpan={company.sites.length}
                            >
                              {company.companyName}
                            </td>
                          ) : null}
                          <td style={{ padding: '10px 12px' }}>{site.siteName}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 500 }}>
                            {site.total}
                          </td>
                          {Object.keys(STATUS_KEYS).map((statusKey) => (
                            <td key={statusKey} style={{ padding: '10px 8px', textAlign: 'right' }}>
                              {(site.byStatus?.[statusKey] ?? 0) > 0 ? (
                                <span
                                  style={{
                                    display: 'inline-block',
                                    minWidth: 24,
                                    padding: '2px 6px',
                                    borderRadius: 4,
                                    background: 'rgba(16, 50, 106, 0.1)',
                                    fontWeight: 500,
                                  }}
                                >
                                  {site.byStatus[statusKey]}
                                </span>
                              ) : (
                                '—'
                              )}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

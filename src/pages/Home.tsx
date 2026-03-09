import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthContext'
import { getMenu } from '../api/auth'
import { buildMenuGroups } from '../utils/menuUtils'
import Card from '../components/Card'
import Button from '../components/Button'

export default function Home() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [menuItems, setMenuItems] = useState<{ id: number; description: string; uri: string; position: number; type: 'H' | 'N' }[]>([])

  useEffect(() => {
    if (!user) {
      setMenuItems([])
      return
    }
    getMenu()
      .then(setMenuItems)
      .catch(() => setMenuItems([]))
  }, [user])

  const menuGroups = useMemo(() => buildMenuGroups(menuItems), [menuItems])

  return (
    <div>
      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h1 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--color-primary)' }}>
          {t('home.welcome', { username: user?.username ?? '' })}
        </h1>
        <p style={{ margin: 'var(--spacing) 0 0', color: 'var(--color-text-muted)' }}>
          {t('home.subtitle')}
        </p>
      </div>

      {menuGroups.map((group) => (
        group.items.length > 0 && (
          <div key={group.label} style={{ marginBottom: 'var(--spacing-lg)' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: 'var(--spacing-md)' }}>
              {group.labelKey ? t(group.labelKey) : group.label}
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: 'var(--spacing-md)',
              }}
            >
              {group.items.map((item) => {
                const label = item.labelKey ? t(item.labelKey) : item.label
                const isRequest = item.uri === '/requests'
                const isNewRequest = item.uri === '/requests/new'
                if (isRequest) {
                  return (
                    <Card key={item.uri}>
                      <h3 style={{ margin: '0 0 var(--spacing)', fontSize: '1rem' }}>{label}</h3>
                      <Button to={item.uri} variant="primary" data-testid={`home-link-${item.uri}`}>
                        {t('home.viewRequests')}
                      </Button>
                    </Card>
                  )
                }
                if (isNewRequest) {
                  return (
                    <Card key={item.uri}>
                      <h3 style={{ margin: '0 0 var(--spacing)', fontSize: '1rem' }}>{label}</h3>
                      <Button to={item.uri} variant="success" data-testid={`home-link-${item.uri}`}>
                        {t('home.newRequest')}
                      </Button>
                    </Card>
                  )
                }
                return (
                  <Card key={item.uri}>
                    <Link
                      to={item.uri}
                      data-testid={`home-link-${item.uri}`}
                      style={{
                        display: 'block',
                        color: 'var(--color-primary)',
                        textDecoration: 'none',
                        fontWeight: 500,
                      }}
                    >
                      {label}
                    </Link>
                  </Card>
                )
              })}
            </div>
          </div>
        )
      ))}
    </div>
  )
}

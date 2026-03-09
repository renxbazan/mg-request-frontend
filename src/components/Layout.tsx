import { useState, useRef, useEffect, useMemo } from 'react'
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthContext'
import { getMenu, type MenuItemDTO } from '../api/auth'
import { buildMenuGroups } from '../utils/menuUtils'
import './Layout.css'

function NavLinkItem({ to, children, className = '', onClick, testId }: { to: string; children: React.ReactNode; className?: string; onClick?: () => void; testId?: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `${className} ${isActive ? 'active' : ''}`}
      onClick={onClick}
      data-testid={testId}
    >
      {children}
    </NavLink>
  )
}

function NavDropdown({ label, children, open, onToggle }: { label: string; children: React.ReactNode; open: boolean; onToggle: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node) && open) onToggle()
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [open, onToggle])
  return (
    <div className="layout-nav-dropdown" ref={ref}>
      <button type="button" className={`layout-nav-dropdown-trigger ${open ? 'open' : ''}`} onClick={onToggle} aria-expanded={open}>
        {label}
        <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 5l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {open && <div className="layout-nav-dropdown-panel">{children}</div>}
    </div>
  )
}

export default function Layout() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [menuItems, setMenuItems] = useState<MenuItemDTO[]>([])
  const [dropdownOpenIndex, setDropdownOpenIndex] = useState<number | null>(null)

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
  const firstGroup = menuGroups[0]
  const dropdownGroups = menuGroups.slice(1)

  const handleLogout = () => {
    setDrawerOpen(false)
    logout()
    navigate('/login')
  }

  const closeDrawer = () => setDrawerOpen(false)

  const navLabel = (item: { labelKey: string; label: string }) => item.labelKey ? t(item.labelKey) : item.label

  return (
    <div className="layout">
      <header className="layout-header">
        <Link to="/" className="layout-logo-link" aria-label={t('nav.home')}>
          <img src="/logo.png" alt="MG" className="layout-logo" />
          <span>MG Request</span>
        </Link>

        {/* Desktop nav: dinámico desde API (primer grupo = enlaces directos, resto = dropdowns) */}
        <nav className="layout-nav-desktop">
          {firstGroup?.items.map((item) => (
            <NavLinkItem key={item.uri} to={item.uri} className="layout-nav-link-desktop" testId={`menu-link-${item.uri}`}>
              {navLabel(item)}
            </NavLinkItem>
          ))}
          {dropdownGroups.map((grp, idx) => (
            <NavDropdown
              key={grp.label}
              label={grp.labelKey ? t(grp.labelKey) : grp.label}
              open={dropdownOpenIndex === idx}
              onToggle={() => setDropdownOpenIndex((i) => (i === idx ? null : idx))}
            >
              {grp.items.map((item) => (
                <NavLinkItem
                  key={item.uri}
                  to={item.uri}
                  className="layout-nav-dropdown-link"
                  testId={`menu-link-${item.uri}`}
                  onClick={() => setDropdownOpenIndex(null)}
                >
                  {navLabel(item)}
                </NavLinkItem>
              ))}
            </NavDropdown>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="layout-nav-mobile-btn"
          onClick={() => setDrawerOpen(true)}
          aria-label={t('nav.principal')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          </svg>
        </button>

        <div className="layout-user">
          <NavLinkItem to="/change-password" className="layout-nav-link-desktop" testId="menu-link-/change-password">{t('nav.myAccount')}</NavLinkItem>
          <span className="layout-username">{user?.username}</span>
          <button type="button" className="layout-logout-btn" onClick={handleLogout}>
            {t('nav.logout')}
          </button>
        </div>
      </header>

      {/* Mobile drawer overlay */}
      <div
        className={`layout-drawer-overlay ${drawerOpen ? 'open' : ''}`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Mobile drawer */}
      <aside className={`layout-drawer ${drawerOpen ? 'open' : ''}`}>
        <div className="layout-drawer-header">
          <button
            type="button"
            className="layout-nav-mobile-btn"
            onClick={closeDrawer}
            aria-label="Cerrar menú"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>
        <nav className="layout-drawer-nav">
          {menuGroups.map((grp) => (
            <div key={grp.label} className="layout-nav-group">
              <div className="layout-nav-group-title">{grp.labelKey ? t(grp.labelKey) : grp.label}</div>
              <div className="layout-nav-group-links">
                {grp.items.map((item) => (
                  <NavLinkItem key={item.uri} to={item.uri} className="layout-nav-link" onClick={closeDrawer}>
                    {navLabel(item)}
                  </NavLinkItem>
                ))}
              </div>
            </div>
          ))}
          <div className="layout-drawer-user layout-nav-group">
            <div className="layout-nav-group-title">{t('nav.user')}</div>
            <div className="layout-nav-group-links">
              <NavLinkItem to="/change-password" className="layout-nav-link" onClick={closeDrawer}>{t('nav.myAccount')}</NavLinkItem>
              <button type="button" className="layout-nav-link" style={{ width: '100%', textAlign: 'left', border: 'none', background: 'none', font: 'inherit', cursor: 'pointer' }} onClick={handleLogout}>
                {t('nav.logout')}
              </button>
            </div>
          </div>
        </nav>
      </aside>

      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  )
}

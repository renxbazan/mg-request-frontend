import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { login as apiLogin, getMe, LoginRequest, LoginResponse } from '../api/auth'

interface User {
  username: string
  userId: number
  profileId: number
  locale: string
  employee?: boolean
  /** Solo para Company Admin: companyId de su customer. */
  companyId?: number | null
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (data: LoginRequest) => Promise<void>
  logout: () => void
  /** Recarga los datos del usuario actual desde el servidor (útil cuando el admin actualiza su propio locale). */
  refreshMe: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation()
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [isLoading, setIsLoading] = useState(true)

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    if (!token) {
      setUser(null)
      setIsLoading(false)
      return
    }
    const stored = localStorage.getItem('user')
    if (stored) {
      try {
        const u = JSON.parse(stored)
        setUser({
          username: u.username ?? '',
          userId: u.userId ?? 0,
          profileId: u.profileId ?? 0,
          locale: u.locale ?? 'es',
          employee: u.employee,
          companyId: u.companyId,
        })
      } catch (_) {}
    }
    getMe()
      .then((data) => {
        const u = JSON.parse(localStorage.getItem('user') || '{}')
        const locale = data.locale === 'en' ? 'en' : 'es'
        setUser({
          username: data.username,
          userId: data.userId ?? u.userId ?? 0,
          profileId: data.profileId ?? u.profileId ?? 0,
          locale,
          employee: data.employee,
          companyId: data.companyId ?? u.companyId,
        })
        localStorage.setItem('user', JSON.stringify({ ...u, username: data.username, locale, userId: data.userId ?? u.userId, profileId: data.profileId ?? u.profileId, employee: data.employee, companyId: data.companyId ?? u.companyId }))
        i18n.changeLanguage(locale)
      })
      .catch(() => logout())
      .finally(() => setIsLoading(false))
  }, [token, logout, i18n])

  const login = useCallback(async (data: LoginRequest) => {
    const res: LoginResponse = await apiLogin(data)
    if (res.message) throw new Error(res.message)
    const locale = res.locale === 'en' ? 'en' : 'es'
    localStorage.setItem('token', res.token)
    localStorage.setItem('user', JSON.stringify({
      userId: res.userId,
      profileId: res.profileId,
      username: res.username,
      locale,
    }))
    setToken(res.token)
    setUser({ username: res.username, userId: res.userId, profileId: res.profileId, locale })
    i18n.changeLanguage(locale)
  }, [i18n])

  const refreshMe = useCallback(async () => {
    const data = await getMe()
    const u = JSON.parse(localStorage.getItem('user') || '{}')
    const locale = data.locale === 'en' ? 'en' : 'es'
    setUser({
      username: data.username,
      userId: data.userId ?? u.userId ?? 0,
      profileId: data.profileId ?? u.profileId ?? 0,
      locale,
      employee: data.employee,
      companyId: data.companyId ?? u.companyId,
    })
    localStorage.setItem('user', JSON.stringify({ ...u, username: data.username, locale, userId: data.userId ?? u.userId, profileId: data.profileId ?? u.profileId, employee: data.employee, companyId: data.companyId ?? u.companyId }))
    i18n.changeLanguage(locale)
  }, [i18n])

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshMe, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

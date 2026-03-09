export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  username: string
  userId: number
  profileId: number
  locale?: string
  message?: string
}

export interface MeResponse {
  username: string
  locale: string
  userId?: number
  profileId?: number
  employee?: boolean
  /** Solo presente para Company Admin: companyId de su customer. */
  companyId?: number | null
}

export interface MenuItemDTO {
  id: number
  description: string
  uri: string
  position: number
  type: 'H' | 'N'
}

import { api } from './client'

export function login(body: LoginRequest): Promise<LoginResponse> {
  return fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(async (res) => {
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Error al iniciar sesión')
    return data
  })
}

export function changeMyPassword(currentPassword: string, newPassword: string): Promise<void> {
  return api.put<void>('/api/auth/me/password', { currentPassword, newPassword })
}

export function getMe(): Promise<MeResponse> {
  return api.get<MeResponse>('/api/auth/me')
}

export function getMenu(): Promise<MenuItemDTO[]> {
  return api.get<MenuItemDTO[]>('/api/auth/menu')
}

export function changeLocale(locale: 'es' | 'en'): Promise<void> {
  return api.put<void>('/api/auth/me/locale', { locale })
}

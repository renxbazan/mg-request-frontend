import { api } from './client'

export interface UserDto {
  id: number
  username: string
  customerId: number | null
  profileId: number | null
  siteId: number | null
  locale?: string | null
}

export interface UserCreateDto {
  username: string
  password?: string
  customerId: number
  profileId: number
  siteId?: number | null
  locale?: string
}

export type UserUpdateBody = {
  customerId?: number
  profileId?: number
  siteId?: number | null
  locale?: string
}

export const usersApi = {
  list: (companyId?: number) =>
    api.get<UserDto[]>(companyId != null ? `/api/users?companyId=${companyId}` : '/api/users'),
  workers: () => api.get<UserDto[]>('/api/users/workers'),
  create: (body: UserCreateDto) => api.post<UserDto>('/api/users', body),
  update: (id: number, body: UserUpdateBody) =>
    api.put<UserDto>(`/api/users/${id}`, body),
  delete: (id: number) => api.delete(`/api/users/${id}`),
  changePassword: (userId: number, newPassword: string) =>
    api.put<void>(`/api/users/${userId}/password`, { newPassword }),
}

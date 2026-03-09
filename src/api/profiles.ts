import { api } from './client'

export interface ProfileDto {
  id: number
  description: string
}

export const profilesApi = {
  list: () => api.get<ProfileDto[]>('/api/profiles'),
  create: (body: { description: string }) => api.post<ProfileDto>('/api/profiles', body),
  update: (id: number, body: { description: string }) => api.put<ProfileDto>(`/api/profiles/${id}`, body),
  delete: (id: number) => api.delete(`/api/profiles/${id}`),
}

import { api } from './client'

export type RequestStatus = 'PENDING_APPROVAL' | 'CREATED' | 'ASSIGNED' | 'IN_TRANSIT' | 'DONE' | 'RATED' | 'REJECTED'

export interface RequestHistoryDto {
  id: number
  requestStatus: RequestStatus
  comments: string | null
  rating: number | null
  createDate: string
  userName?: string | null
}

export interface RequestDto {
  id: number
  serviceCategoryId: number
  serviceSubCategoryId: number | null
  location: string | null
  description: string
  siteId: number
  userId: number
  siteName?: string | null
  companyName?: string | null
  requesterName?: string | null
  assignedStaffName?: string | null
  canRate?: boolean
  rating?: number | null
  requestStatus: RequestStatus
  createDate: string
  priority: string | null
  history?: RequestHistoryDto[]
}

export interface RequestCreateDto {
  siteId: number
  serviceCategoryId: number
  serviceSubCategoryId?: number
  location?: string
  description: string
  priority?: string
}

export const requestsApi = {
  list: () => api.get<RequestDto[]>('/api/requests'),
  my: () => api.get<RequestDto[]>('/api/requests/my'),
  assigned: () => api.get<RequestDto[]>('/api/requests/assigned'),
  get: (id: number) => api.get<RequestDto>(`/api/requests/${id}`),
  create: (body: RequestCreateDto) => api.post<RequestDto>('/api/requests', body),
  approve: (id: number) => api.put<RequestDto>(`/api/requests/${id}/approve`),
  reject: (id: number) => api.put<RequestDto>(`/api/requests/${id}/reject`),
  attend: (id: number) => api.put<RequestDto>(`/api/requests/${id}/attend`),
  close: (id: number, comment?: string) =>
    api.put<RequestDto>(`/api/requests/${id}/close${comment != null ? `?comment=${encodeURIComponent(comment)}` : ''}`),
  rate: (id: number, rating: number, comment?: string) => {
    const params = new URLSearchParams({ rating: String(rating) })
    if (comment != null) params.set('comment', comment)
    return api.put<RequestDto>(`/api/requests/${id}/rate?${params}`)
  },
}

export interface RequestAssignmentDto {
  id: number
  requestId: number
  userId: number
}

export const requestAssignmentsApi = {
  getByRequest: (requestId: number) =>
    api.get<RequestAssignmentDto | null>(`/api/request-assignments/request/${requestId}`),
  assign: (requestId: number, userId: number) =>
    api.post<RequestAssignmentDto>('/api/request-assignments', { requestId, userId }),
}

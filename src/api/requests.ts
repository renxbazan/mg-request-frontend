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

export interface RequestAttachmentDto {
  id: number
  url: string | null
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
  assignedUserId?: number | null
  canRate?: boolean
  rating?: number | null
  requestStatus: RequestStatus
  createDate: string
  priority: string | null
  history?: RequestHistoryDto[]
  attachments?: RequestAttachmentDto[]
}

export interface RequestCreateDto {
  siteId: number
  serviceCategoryId: number
  serviceSubCategoryId?: number
  location?: string
  description: string
  priority?: string
}

export interface PageResult<T> {
  items: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export const requestsApi = {
  list: (params?: { page?: number; size?: number; status?: string; priority?: string; companyId?: number }) => {
    const search = new URLSearchParams()
    if (params?.page != null) search.set('page', String(params.page))
    if (params?.size != null) search.set('size', String(params.size))
    if (params?.status) search.set('status', params.status)
    if (params?.priority) search.set('priority', params.priority)
    if (params?.companyId != null) search.set('companyId', String(params.companyId))
    const qs = search.toString()
    return api.get<PageResult<RequestDto>>(`/api/requests${qs ? `?${qs}` : ''}`)
  },
  my: () => api.get<RequestDto[]>('/api/requests/my'),
  assigned: () => api.get<RequestDto[]>('/api/requests/assigned'),
  get: (id: number) => api.get<RequestDto>(`/api/requests/${id}`),
  create: (body: RequestCreateDto) => api.post<RequestDto>('/api/requests', body),
  createWithAttachments: (formData: FormData) => api.postFormData<RequestDto>('/api/requests/with-attachments', formData),
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

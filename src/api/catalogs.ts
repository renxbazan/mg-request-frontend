import { api } from './client'

export interface CompanyDto {
  id: number
  name: string
  description: string | null
  companyType: string
}

export interface SiteDto {
  id: number
  name: string
  description: string | null
  companyId: number
  companyName?: string | null
}

export interface ServiceCategoryDto {
  id: number
  name: string
  description: string | null
}

export interface ServiceSubCategoryDto {
  id: number
  name: string
  description: string | null
  serviceCategoryId: number
}

export interface CompanyCreateDto {
  name: string
  description?: string | null
  companyType: string
}

export interface SiteCreateDto {
  name: string
  description?: string | null
  companyId: number
}

export interface ServiceCategoryCreateDto {
  name: string
  description?: string | null
}

export interface ServiceSubCategoryCreateDto {
  name: string
  description?: string | null
  serviceCategoryId: number
}

export interface RequestApproverDto {
  id: number
  userId: number
  userName: string
  scope: 'COMPANY' | 'SITE'
  companyId: number
  siteId?: number | null
  siteName?: string | null
}

export const catalogsApi = {
  companies: () => api.get<CompanyDto[]>('/api/companies'),
  getCompany: (id: number) => api.get<CompanyDto>(`/api/companies/${id}`),
  createCompany: (body: CompanyCreateDto) => api.post<CompanyDto>('/api/companies', body),
  updateCompany: (id: number, body: CompanyCreateDto) => api.put<CompanyDto>(`/api/companies/${id}`, body),
  deleteCompany: (id: number) => api.delete(`/api/companies/${id}`),

  listApprovers: (companyId: number) =>
    api.get<RequestApproverDto[]>(`/api/companies/${companyId}/approvers`),
  addApprover: (companyId: number, body: { userId: number; scope: 'COMPANY' | 'SITE'; siteId?: number }) =>
    api.post<RequestApproverDto>(`/api/companies/${companyId}/approvers`, body),
  removeApprover: (companyId: number, userId: number, params?: { companyLevel?: boolean; siteId?: number }) => {
    const search = new URLSearchParams()
    search.set('userId', String(userId))
    if (params?.companyLevel !== undefined) search.set('companyLevel', String(params.companyLevel))
    if (params?.siteId !== undefined) search.set('siteId', String(params.siteId))
    return api.delete(`/api/companies/${companyId}/approvers?${search}`)
  },

  sites: (companyId?: number) =>
    api.get<SiteDto[]>(companyId != null ? `/api/sites?companyId=${companyId}` : '/api/sites'),
  createSite: (body: SiteCreateDto) => api.post<SiteDto>('/api/sites', body),
  updateSite: (id: number, body: SiteCreateDto) => api.put<SiteDto>(`/api/sites/${id}`, body),
  deleteSite: (id: number) => api.delete(`/api/sites/${id}`),

  serviceCategories: () => api.get<ServiceCategoryDto[]>('/api/service-categories'),
  createServiceCategory: (body: ServiceCategoryCreateDto) =>
    api.post<ServiceCategoryDto>('/api/service-categories', body),
  updateServiceCategory: (id: number, body: ServiceCategoryCreateDto) =>
    api.put<ServiceCategoryDto>(`/api/service-categories/${id}`, body),
  deleteServiceCategory: (id: number) => api.delete(`/api/service-categories/${id}`),

  serviceSubCategories: (categoryId?: number) =>
    api.get<ServiceSubCategoryDto[]>(
      categoryId != null ? `/api/service-sub-categories?serviceCategoryId=${categoryId}` : '/api/service-sub-categories'
    ),
  createServiceSubCategory: (body: ServiceSubCategoryCreateDto) =>
    api.post<ServiceSubCategoryDto>('/api/service-sub-categories', body),
  updateServiceSubCategory: (id: number, body: ServiceSubCategoryCreateDto) =>
    api.put<ServiceSubCategoryDto>(`/api/service-sub-categories/${id}`, body),
  deleteServiceSubCategory: (id: number) => api.delete(`/api/service-sub-categories/${id}`),
}

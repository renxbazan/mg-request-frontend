import { api } from './client'

export interface CustomerDto {
  id: number
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  companyId: number | null
  employee: boolean
}

export const customersApi = {
  list: (companyId?: number, employeesOnly?: boolean) => {
    const params = new URLSearchParams()
    if (companyId != null) params.set('companyId', String(companyId))
    if (employeesOnly === true) params.set('employeesOnly', 'true')
    const q = params.toString()
    return api.get<CustomerDto[]>(q ? `/api/customers?${q}` : '/api/customers')
  },
  create: (body: { firstName: string; lastName: string; email?: string; companyId?: number; employee?: boolean }) =>
    api.post<CustomerDto>('/api/customers', body),
  update: (id: number, body: { firstName?: string; lastName?: string; email?: string | null; phone?: string | null; companyId?: number | null; employee?: boolean }) =>
    api.put<CustomerDto>(`/api/customers/${id}`, body),
  delete: (id: number) => api.delete(`/api/customers/${id}`),
}

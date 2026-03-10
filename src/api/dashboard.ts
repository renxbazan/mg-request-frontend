import { api } from './client'

export interface CompanySiteStats {
  siteId: number
  siteName: string
  total: number
  byStatus: Record<string, number>
}

export interface CompanyStats {
  companyId: number
  companyName: string
  total: number
  byStatus: Record<string, number>
  sites: CompanySiteStats[]
}

export interface DashboardStats {
  byStatus: Record<string, number>
  byPriority: Record<string, number>
  ratingsByWorker?: Array<{ workerId: number; workerName: string; count: number; avgRating: number }>
  byCompany?: CompanyStats[]
}

export const dashboardApi = {
  stats: (range: string) =>
    api.get<DashboardStats>(`/api/dashboard/stats?range=${encodeURIComponent(range)}`),
}

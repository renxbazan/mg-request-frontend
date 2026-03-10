const getBaseUrl = () => import.meta.env.VITE_API_BASE_URL || ''

const getToken = (): string | null => localStorage.getItem('token')

/** Mensaje lanzado en 403 para que la UI pueda mostrar la traducción (common.forbidden). */
export const FORBIDDEN_ERROR_MESSAGE = 'FORBIDDEN'

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${getBaseUrl()}${path}`
  const token = getToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }
  const res = await fetch(url, { ...options, headers })
  if (res.status === 401) {
    localStorage.removeItem('token')
    window.location.href = '/login'
    throw new Error('No autorizado')
  }
  if (!res.ok) {
    const text = await res.text()
    if (res.status === 403) {
      throw new Error(FORBIDDEN_ERROR_MESSAGE)
    }
    throw new Error(text || `Error ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  const contentType = res.headers.get('content-type')
  if (contentType?.includes('application/json')) {
    return res.json() as Promise<T>
  }
  return undefined as T
}

export async function apiPostFormData<T>(path: string, formData: FormData): Promise<T> {
  const url = `${getBaseUrl()}${path}`
  const token = getToken()
  const headers: HeadersInit = {}
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }
  const res = await fetch(url, { method: 'POST', body: formData, headers })
  if (res.status === 401) {
    localStorage.removeItem('token')
    window.location.href = '/login'
    throw new Error('No autorizado')
  }
  if (!res.ok) {
    const text = await res.text()
    if (res.status === 403) throw new Error(FORBIDDEN_ERROR_MESSAGE)
    throw new Error(text || `Error ${res.status}`)
  }
  const contentType = res.headers.get('content-type')
  if (contentType?.includes('application/json')) return res.json() as Promise<T>
  return undefined as T
}

export const api = {
  get: <T>(path: string) => apiRequest<T>(path),
  post: <T>(path: string, body: unknown) =>
    apiRequest<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  postFormData: apiPostFormData,
  put: <T>(path: string, body?: unknown) =>
    apiRequest<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  delete: (path: string) => apiRequest<void>(path, { method: 'DELETE' }),
}

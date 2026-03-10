export type SeedState = {
  runId: string
  prefix: string
  companyAId?: number
  companyBId?: number
  siteAIds?: number[]
  siteBIds?: number[]
  categoryId?: number
  subCategoryId?: number
  requesterUserId?: number
  companyAdminUserId?: number
  workerUserId?: number
}

const baseApiUrl = process.env.E2E_API_URL || 'http://localhost:8080'

async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${baseApiUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })
  const text = await res.text()
  const data = text ? safeJson(text) : undefined
  if (!res.ok) {
    throw new Error(`API ${res.status} ${path}: ${text}`)
  }
  return data
}

function safeJson(text: string) {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export async function apiLogin(username: string, password: string): Promise<string> {
  const data = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
  if (!data?.token) throw new Error('Login sin token')
  return data.token as string
}

export async function apiCleanup(prefix: string, token: string) {
  try {
    await apiFetch('/api/test/cleanup', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ prefix }),
    })
  } catch (e) {
    // Si el endpoint no existe (perfil no-test), no rompemos el setup; los E2E fallarán luego y será visible.
    // eslint-disable-next-line no-console
    console.warn('Cleanup failed:', e)
  }
}

export async function apiCreateCustomer(
  token: string,
  body: { firstName: string; lastName: string; email?: string; companyId: number; employee: boolean },
): Promise<number> {
  const data = await apiFetch('/api/customers', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  })
  return (data as { id: number }).id
}

export async function apiCreateUser(
  token: string,
  body: { username: string; password: string; customerId: number; profileId: number; siteId?: number | null },
): Promise<number> {
  const data = await apiFetch('/api/users', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  })
  return (data as { id: number }).id
}

/** Crea una solicitud vía API (site 1, category 1 del seed). Retorna { id, description }. */
export async function apiCreateRequest(
  token: string,
  description: string,
): Promise<{ id: number; description: string }> {
  const data = await apiFetch('/api/requests', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      siteId: 1,
      serviceCategoryId: 1,
      description,
      priority: 'M',
    }),
  })
  return { id: (data as { id: number }).id, description }
}



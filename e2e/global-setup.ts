// Limpiar datos E2E y de tests JUnit antes de la suite para evitar acumulación en mgdb_test.
import { apiLogin, apiCleanup } from './fixtures/api'

export default async function globalSetup() {
  try {
    const token = await apiLogin('admin', 'password')
    await apiCleanup('e2e_', token)
    await apiCleanup('reqtest_', token)
  } catch {
    // Si el backend no está levantado o cleanup falla, no bloquear la suite
  }
}


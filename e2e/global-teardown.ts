// Limpiar datos E2E y de tests JUnit después de la suite para dejar mgdb_test limpia.
import { apiLogin, apiCleanup } from './fixtures/api'

export default async function globalTeardown() {
  try {
    const token = await apiLogin('admin', 'password')
    await apiCleanup('e2e_', token)
    await apiCleanup('reqtest_', token)
  } catch {
    // Ignorar si el backend no está disponible o cleanup falla
  }
}


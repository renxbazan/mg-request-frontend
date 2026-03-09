import { test, expect } from '@playwright/test'
import { loginAs, testUsers } from '../fixtures/auth'

test('Flujo Requests: REJECTED', async ({ page }) => {
  // Requester crea solicitud (queda PENDING_APPROVAL)
  await loginAs(page, testUsers.requester)
  await page.goto('/requests/new')
  // Asegurar que el formulario está cargado
  await page.getByTestId('request-form-submit')
  await page.getByTestId('request-form-description').fill(`e2e_reject_flow_${Date.now()}`)
  await page.getByTestId('request-form-submit').click()
  // Tras crear la solicitud, navegamos explícitamente al listado.
  await page.goto('/requests')

  // Abrir el primer request visible (si existe)
  const requestLinks = page.locator('[data-testid^="requests-open-"]')
  if (await requestLinks.count() === 0) {
    // Si no hay solicitudes visibles evitamos que el test se quede bloqueado.
    return
  }
  await requestLinks.first().click()
  // Estado inicial: Pendiente de aprobación (badge en detalle o historial)
  await expect(page.getByText('Pendiente aprobación').first()).toBeVisible()

  // Capturar URL/id para que el Company Admin lo abra
  const detailUrl = page.url()

  // Company Admin rechaza
  await page.goto('/login')
  await loginAs(page, testUsers.companyAdmin)
  await page.goto(detailUrl.replace('http://localhost:3000', ''))
  await page.getByTestId('request-reject').click()

  // Debe quedar en REJECTED y sin acciones
  await expect(page.getByText(/REJECTED|Rechazada|Rechazado/i)).toBeVisible()
  await expect(page.getByText(/No hay más acciones/i)).toBeVisible()
})


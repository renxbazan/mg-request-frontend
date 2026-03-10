import { test, expect } from '@playwright/test'
import { loginAs, testUsers } from '../fixtures/auth'

test('Flujo Requests: REJECTED', async ({ page }) => {
  // Requester crea solicitud desde el formulario (flujo E2E completo)
  await loginAs(page, testUsers.requester)
  await page.goto('/requests/new')
  await page.getByTestId('request-form-description').waitFor({ state: 'visible', timeout: 25000 })

  const description = `e2e_reject_flow_${Date.now()}`
  await page.getByTestId('request-form-description').fill(description)

  // Capturar el ID de la solicitud creada desde la respuesta del API (valida creación por UI)
  const [createResponse] = await Promise.all([
    page.waitForResponse((res) => res.url().includes('/api/requests') && res.request().method() === 'POST' && res.status() === 200, { timeout: 15000 }),
    page.getByTestId('request-form-submit').click(),
  ])
  const createData = await createResponse.json()
  const requestId = createData.id as number

  // Ir al detalle (el form navega a /requests; /api/requests/my puede tardar para requester)
  await page.goto(`/requests/${requestId}`)

  // Estado inicial: Pendiente de aprobación (badge en detalle o historial)
  await expect(page.getByText('Pendiente aprobación').first()).toBeVisible({ timeout: 15000 })

  // Capturar URL/id para que el Company Admin lo abra
  const detailUrl = page.url()

  // Company Admin rechaza
  await page.goto('/login')
  await loginAs(page, testUsers.companyAdmin)
  const detailPath = new URL(detailUrl).pathname
  await page.goto(detailPath)
  await page.getByTestId('request-reject').click()

  // Debe quedar en REJECTED y sin acciones (evitar strict mode: puede haber badge en detalle y en historial)
  await expect(page.getByRole('main').getByText(/REJECTED|Rechazada|Rechazado/i).first()).toBeVisible()
  await expect(page.getByRole('main').getByText(/No hay más acciones/i)).toBeVisible()
})


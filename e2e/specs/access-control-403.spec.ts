import { test, expect } from '@playwright/test'
import { loginAs, testUsers } from '../fixtures/auth'

test('Company Admin: 403 muestra mensaje y no redirige a login', async ({ page }) => {
  await loginAs(page, testUsers.companyAdmin)

  // Acceso directo a Companies (aunque no esté en menú)
  await page.goto('/companies')
  // Abrir modal \"Nueva empresa\" usando data-testid.
  const newBtn = page.getByTestId('companies-new')
  if (await newBtn.count()) {
    await newBtn.first().click()
    // Rellenar el nombre para que pase la validación HTML y se dispare la llamada a la API.
    await page.fill('input.input', 'Empresa E2E Forbidden')
    await page.getByTestId('modal-submit').click()
    // Debe mostrarse el mensaje i18n de common.forbidden
    await expect(page.getByText('No tiene permiso para realizar esta acción.')).toBeVisible()
    await expect(page).not.toHaveURL(/\/login/)
  }
})


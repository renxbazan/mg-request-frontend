import { test, expect } from '@playwright/test'
import { loginAs, testUsers } from '../fixtures/auth'

test('Requester E2E puede iniciar sesión y ver solicitudes', async ({ page }) => {
  await loginAs(page, testUsers.requester)
  await page.goto('/requests')
  // Verificar que cargó la página de solicitudes (el fix del ciclo hace que cargue bien)
  await expect(page.getByRole('heading', { name: 'Solicitudes' })).toBeVisible({ timeout: 15000 })
})


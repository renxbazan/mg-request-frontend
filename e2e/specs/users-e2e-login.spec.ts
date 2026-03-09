import { test, expect } from '@playwright/test'
import { loginAs, testUsers } from '../fixtures/auth'

test('Requester E2E puede iniciar sesión y ver solicitudes', async ({ page }) => {
  await loginAs(page, testUsers.requester)
  await page.goto('/requests')
  // Heading único de la página de solicitudes
  await expect(page.getByRole('heading', { name: 'Solicitudes' })).toBeVisible()
})


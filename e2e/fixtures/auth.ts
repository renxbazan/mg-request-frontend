import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export const testUsers = {
  superAdmin: { username: 'admin', password: 'password' },
  requester: { username: 'requester_e2e', password: 'password' },
  companyAdmin: { username: 'company_admin_e2e', password: 'password' },
  worker: { username: 'worker_e2e', password: 'password' },
} as const

export async function loginAs(page: Page, user: { username: string; password: string }) {
  // Login vía UI para respetar el flujo real de la app.
  await page.goto('/login')
  await page.getByTestId('login-username').fill(user.username)
  await page.getByTestId('login-password').fill(user.password)
  await page.getByTestId('login-submit').click()
  // Confirmar que estamos autenticados viendo el usuario en el header.
  await expect(page.locator('.layout-username')).toHaveText(user.username, { timeout: 15000 })
}


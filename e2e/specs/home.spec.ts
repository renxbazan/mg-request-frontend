import { test, expect } from '@playwright/test'
import { loginAs, testUsers } from '../fixtures/auth'

test('Home vs menú: Super Admin muestra enlaces del menú', async ({ page }) => {
  await loginAs(page, testUsers.superAdmin)

  // Al menos los enlaces base del menú deberían existir
  await expect(page.getByTestId('menu-link-/')).toBeVisible()
  await expect(page.getByTestId('menu-link-/requests')).toBeVisible()

  // Y Home debe renderizar cards/links para rutas disponibles del menú
  await page.goto('/')
  await expect(page.getByTestId('home-link-/requests')).toBeVisible()
})


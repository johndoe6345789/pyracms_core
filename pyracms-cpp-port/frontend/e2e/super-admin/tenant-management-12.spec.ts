import { test, expect } from '@playwright/test'
import { ADMIN_USER } from '../support/super-admin-data-1'
import { loginAs } from '../support/super-admin-helpers-1'

test.describe('Tenant management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ADMIN_USER)
    await page.goto('/super-admin/tenants')
    await page
      .getByTestId('super-admin-tenants-page')
      .waitFor({ state: 'visible', timeout: 10_000 })
  })

  test('breadcrumb current item reads "Tenants"', async ({ page }) => {
    await expect(page.getByTestId('breadcrumb-current')).toHaveText('Tenants')
  })

  test('breadcrumb link navigates back to /super-admin', async ({ page }) => {
    await page.getByTestId('breadcrumb-link-super-admin').click()
    await expect(page).toHaveURL(/\/super-admin$/)
  })
})

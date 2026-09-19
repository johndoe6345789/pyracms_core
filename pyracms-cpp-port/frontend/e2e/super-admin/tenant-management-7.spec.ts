import { test, expect } from '@playwright/test'
import { ADMIN_USER, MOCK_TENANTS } from '../support/super-admin-data-1'
import { loginAs, waitForTenantsLoaded } from '../support/super-admin-helpers-1'

test.describe('Tenant management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ADMIN_USER)
    await page.goto('/super-admin/tenants')
    await page
      .getByTestId('super-admin-tenants-page')
      .waitFor({ state: 'visible', timeout: 10_000 })
  })

  test(
    'confirm-delete-tenant button is keyboard-activatable',
    async ({ page }) => {
      await page.route('**/api/tenants', (route) => {
        if (route.request().method() === 'GET') {
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(MOCK_TENANTS),
          })
        }
        if (route.request().method() === 'DELETE') {
          return route.fulfill({ status: 204 })
        }
        return route.continue()
      })

      await page.goto('/super-admin/tenants')
      await page
        .getByTestId('super-admin-tenants-page')
        .waitFor({ state: 'visible', timeout: 10_000 })
      await waitForTenantsLoaded(page)

      await page
        .getByTestId('delete-tenant-alpha')
        .click()

      const confirmBtn = page.getByTestId(
        'confirm-delete-tenant',
      )
      await confirmBtn.focus()
      await expect(confirmBtn).toBeFocused()
      await page.keyboard.press('Enter')

      await expect(
        page.getByTestId('tenant-delete-dialog'),
      ).not.toBeVisible()
    },
  )
})

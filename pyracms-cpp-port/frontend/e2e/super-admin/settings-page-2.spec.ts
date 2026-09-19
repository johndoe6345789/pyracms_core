import { test, expect } from '@playwright/test'
import { ADMIN_USER } from '../support/super-admin-data-1'
import { loginAs } from '../support/super-admin-helpers-1'

test.describe('Settings page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ADMIN_USER)
    await page.goto('/super-admin/settings')
    await page
      .getByTestId('super-admin-settings-page')
      .waitFor({ state: 'visible', timeout: 10_000 })
  })

  test(
    'breadcrumb "Super Admin" link navigates to '
    + '/super-admin',
    async ({ page }) => {
      await page
        .getByTestId('breadcrumb-link-super-admin')
        .click()
      await expect(page).toHaveURL(/\/super-admin$/)
    },
  )
})

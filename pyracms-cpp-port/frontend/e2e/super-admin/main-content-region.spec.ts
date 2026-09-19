import { test, expect } from '@playwright/test'
import { ADMIN_USER } from '../support/super-admin-data-1'
import { goToSuperAdmin, loginAs } from '../support/super-admin-helpers-1'

test.describe('Main content region', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ADMIN_USER)
    await goToSuperAdmin(page)
  })

  test('main content area has correct data-testid', async ({ page }) => {
    await expect(page.getByTestId('super-admin-main-content')).toBeVisible()
  })

  test('each page renders inside the main content area', async ({ page }) => {
    for (const [path, testId] of [
      ['/super-admin/tenants', 'super-admin-tenants-page'],
      ['/super-admin/users', 'super-admin-users-page'],
      ['/super-admin/settings', 'super-admin-settings-page'],
    ] as [string, string][]) {
      await page.goto(path)
      const main = page.getByTestId('super-admin-main-content')
      await expect(main).toBeVisible()
      await expect(main.getByTestId(testId)).toBeVisible()
    }
  })
})

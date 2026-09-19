import { test, expect } from '@playwright/test'
import {
  goToAdmin,
  loginAsAdmin,
  mockApiRoutes,
} from '../support/site-admin-helpers-1'

test.describe('Admin Backup', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
    await loginAsAdmin(page)
    await goToAdmin(page, '/backup')
  })

  test('hidden file input is attached to DOM', async ({ page }) => {
    await expect(
      page.locator('input[type="file"][accept=".json"]'),
    ).toBeAttached()
  })

  test('admin sidebar is present on backup page', async ({ page }) => {
    await expect(page.getByTestId('admin-sidebar')).toBeVisible()
  })
})

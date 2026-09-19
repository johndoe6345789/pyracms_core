import { test, expect } from '@playwright/test'
import {
  goToAdmin,
  loginAsAdmin,
  mockApiRoutes,
} from '../support/site-admin-helpers-1'

test.describe('Admin Templates', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
    await loginAsAdmin(page)
    await goToAdmin(page, '/templates')
  })

  test('admin sidebar is present on templates page', async ({ page }) => {
    await expect(page.getByTestId('admin-sidebar')).toBeVisible()
  })
})

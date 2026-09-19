import { test, expect } from '@playwright/test'
import {
  goToAdmin,
  loginAsAdmin,
  mockApiRoutes,
} from '../support/site-admin-helpers-1'

test.describe('Admin Styles', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
    await loginAsAdmin(page)
    await goToAdmin(page, '/styles')
  })

  test(
    'admin sidebar is present on styles page',
    async ({ page }) => {
      await expect(
        page.getByTestId('admin-sidebar'),
      ).toBeVisible()
    },
  )
})

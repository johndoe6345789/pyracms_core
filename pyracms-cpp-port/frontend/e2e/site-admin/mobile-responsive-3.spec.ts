import { test, expect } from '@playwright/test'
import { SITE_SLUG } from '../support/site-admin-data-1'
import {
  goToAdmin,
  loginAsAdmin,
  mockApiRoutes,
} from '../support/site-admin-helpers-1'

test.describe('Mobile responsive — 375×667', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
    await loginAsAdmin(page)
    await goToAdmin(page)
  })

  test('clicking a nav item in drawer navigates and closes drawer', async ({
    page,
  }) => {
    await page.getByTestId('admin-menu-toggle').click()
    const drawer = page.getByTestId('admin-drawer-mobile')
    await drawer.getByTestId('admin-nav-users').click()
    await expect(page).toHaveURL(new RegExp(`/site/${SITE_SLUG}/admin/users`))
  })
})

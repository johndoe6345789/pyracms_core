import { test, expect } from '@playwright/test'
import { SITE_SLUG } from '../support/site-admin-data-1'
import {
  goToAdmin,
  loginAsAdmin,
  mockApiRoutes,
} from '../support/site-admin-helpers-1'

test.describe('Admin sidebar navigation', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
    await loginAsAdmin(page)
    await goToAdmin(page)
  })

  test('nav list is rendered', async ({ page }) => {
    await expect(page.getByTestId('admin-nav-list')).toBeVisible()
  })

  test('all primary nav items are visible', async ({ page }) => {
    const navItems = [
      'admin-nav-dashboard',
      'admin-nav-users',
      'admin-nav-settings',
      'admin-nav-feature-toggles',
      'admin-nav-menus',
      'admin-nav-files',
      'admin-nav-styles',
      'admin-nav-analytics',
      'admin-nav-backup',
    ]
    for (const testId of navItems) {
      await expect(page.getByTestId(testId)).toBeVisible()
    }
  })

  test('clicking Users nav item navigates to users page', async ({ page }) => {
    await page.getByTestId('admin-nav-users').click()
    await expect(page).toHaveURL(new RegExp(`/site/${SITE_SLUG}/admin/users`))
    await expect(page.getByTestId('admin-users-page')).toBeVisible()
  })
})

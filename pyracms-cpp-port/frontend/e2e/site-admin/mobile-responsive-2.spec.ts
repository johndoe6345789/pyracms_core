import { test, expect } from '@playwright/test'
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

  test('mobile drawer contains users nav item', async ({ page }) => {
    await page.getByTestId('admin-menu-toggle').click()
    const drawer = page.getByTestId('admin-drawer-mobile')
    await expect(drawer.getByTestId('admin-nav-users')).toBeVisible()
  })

  test('mobile drawer contains all nav items', async ({ page }) => {
    await page.getByTestId('admin-menu-toggle').click()
    const drawer = page.getByTestId('admin-drawer-mobile')
    const navItems = [
      'admin-nav-settings',
      'admin-nav-feature-toggles',
      'admin-nav-menus',
      'admin-nav-acl',
      'admin-nav-files',
      'admin-nav-analytics',
      'admin-nav-backup',
    ]
    for (const testId of navItems) {
      await expect(drawer.getByTestId(testId)).toBeVisible()
    }
  })

  test('mobile drawer contains "Back to Site" link', async ({ page }) => {
    await page.getByTestId('admin-menu-toggle').click()
    const drawer = page.getByTestId('admin-drawer-mobile')
    await expect(drawer.getByTestId('admin-back-to-site')).toBeVisible()
  })
})

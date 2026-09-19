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

  test('hamburger menu toggle is visible on mobile', async ({ page }) => {
    await expect(page.getByTestId('admin-menu-toggle')).toBeVisible()
  })

  test('hamburger toggle has aria-label "Open admin menu"', async ({
    page,
  }) => {
    await expect(
      page.getByRole('button', {
        name: /open admin menu/i,
      }),
    ).toBeVisible()
  })

  test('permanent sidebar is NOT visible at mobile width', async ({ page }) => {
    await expect(page.getByTestId('admin-sidebar')).not.toBeVisible()
  })

  test('clicking hamburger opens the mobile drawer', async ({ page }) => {
    await page.getByTestId('admin-menu-toggle').click()
    await expect(page.getByTestId('admin-drawer-mobile')).toBeVisible()
  })

  test('mobile drawer contains dashboard nav item', async ({ page }) => {
    await page.getByTestId('admin-menu-toggle').click()
    const drawer = page.getByTestId('admin-drawer-mobile')
    await expect(drawer).toBeVisible()
    await expect(drawer.getByTestId('admin-nav-dashboard')).toBeVisible()
  })
})

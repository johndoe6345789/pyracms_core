import { test, expect } from '@playwright/test'
import { ADMIN_USER } from '../support/super-admin-data-1'
import { goToSuperAdmin, loginAs } from '../support/super-admin-helpers-1'

test.describe('Mobile responsive — 375x667', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test.beforeEach(async ({ page }) => {
    await loginAs(page, ADMIN_USER)
    await goToSuperAdmin(page)
  })

  test(
    'hamburger menu button is visible on mobile',
    async ({ page }) => {
      await expect(
        page.getByTestId('super-admin-menu-toggle'),
      ).toBeVisible()
    },
  )

  test(
    'clicking hamburger opens drawer with nav items',
    async ({ page }) => {
      await page
        .getByTestId('super-admin-menu-toggle')
        .click()

      const drawer = page.getByTestId(
        'super-admin-drawer-mobile',
      )
      await expect(drawer).toBeVisible()

      // Nav items inside the drawer
      await expect(
        drawer.getByTestId('super-admin-nav-dashboard'),
      ).toBeVisible()
      await expect(
        drawer.getByTestId('super-admin-nav-tenants'),
      ).toBeVisible()
      await expect(
        drawer.getByTestId('super-admin-nav-users'),
      ).toBeVisible()
      await expect(
        drawer.getByTestId('super-admin-nav-settings'),
      ).toBeVisible()
    },
  )

  test(
    'hamburger button has accessible aria-label',
    async ({ page }) => {
      await expect(
        page.getByTestId('super-admin-menu-toggle'),
      ).toHaveAttribute(
        'aria-label',
        'Open super admin menu',
      )
    },
  )
})

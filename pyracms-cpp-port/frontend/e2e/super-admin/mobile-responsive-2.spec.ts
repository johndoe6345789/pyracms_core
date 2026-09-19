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
    'clicking a nav item in the drawer closes it and '
    + 'navigates',
    async ({ page }) => {
      await page
        .getByTestId('super-admin-menu-toggle')
        .click()

      const drawer = page.getByTestId(
        'super-admin-drawer-mobile',
      )
      await expect(drawer).toBeVisible()

      await drawer
        .getByTestId('super-admin-nav-tenants')
        .click()

      await expect(page).toHaveURL(
        /\/super-admin\/tenants/,
      )
      // Drawer should auto-close after nav click
      await expect(
        page.getByTestId('super-admin-drawer-mobile'),
      ).not.toBeVisible({ timeout: 5_000 })
    },
  )

  test(
    'permanent sidebar is NOT visible at mobile width',
    async ({ page }) => {
      // On mobile, only the temporary drawer is used
      await expect(
        page.getByTestId('super-admin-sidebar'),
      ).not.toBeVisible()
    },
  )
})

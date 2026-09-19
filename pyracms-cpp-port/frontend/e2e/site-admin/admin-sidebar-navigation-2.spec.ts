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

  test(
    'clicking Settings nav item navigates to settings page',
    async ({ page }) => {
      await page
        .getByTestId('admin-nav-settings')
        .click()
      await expect(page).toHaveURL(
        new RegExp(
          `/site/${SITE_SLUG}/admin/settings`,
        ),
      )
      await expect(
        page.getByTestId('admin-settings-page'),
      ).toBeVisible()
    },
  )

  test(
    'clicking Features nav item navigates to features page',
    async ({ page }) => {
      await page
        .getByTestId('admin-nav-feature-toggles')
        .click()
      await expect(page).toHaveURL(
        new RegExp(
          `/site/${SITE_SLUG}/admin/features`,
        ),
      )
      await expect(
        page.getByTestId('admin-features-page'),
      ).toBeVisible()
    },
  )

  test(
    'clicking Menus nav item navigates to menus page',
    async ({ page }) => {
      await page
        .getByTestId('admin-nav-menus')
        .click()
      await expect(page).toHaveURL(
        new RegExp(
          `/site/${SITE_SLUG}/admin/menus`,
        ),
      )
      await expect(
        page.getByTestId('admin-menus-page'),
      ).toBeVisible()
    },
  )
})

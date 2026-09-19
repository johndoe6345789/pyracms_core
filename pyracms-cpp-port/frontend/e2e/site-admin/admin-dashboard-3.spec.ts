import { test, expect } from '@playwright/test'
import { SITE_SLUG } from '../support/site-admin-data-1'
import {
  goToAdmin,
  loginAsAdmin,
  mockApiRoutes,
} from '../support/site-admin-helpers-1'

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
    await loginAsAdmin(page)
    await goToAdmin(page)
  })

  test(
    'clicking the Backup quick-link navigates to /backup',
    async ({ page }) => {
      await page
        .getByTestId('quick-link-backup')
        .click()
      await expect(page).toHaveURL(
        new RegExp(
          `/site/${SITE_SLUG}/admin/backup`,
        ),
      )
    },
  )

  test(
    'stats section renders "Total Users" card',
    async ({ page }) => {
      await expect(
        page.getByText('Total Users'),
      ).toBeVisible()
    },
  )

  test(
    'stats section renders "Content Items" card',
    async ({ page }) => {
      await expect(
        page.getByText('Content Items'),
      ).toBeVisible()
    },
  )

  test(
    'stats section renders "Tenants" card',
    async ({ page }) => {
      await expect(
        page.getByText('Tenants'),
      ).toBeVisible()
    },
  )

  test(
    'stats section renders "Settings" card',
    async ({ page }) => {
      // The "Settings" stat card text
      await expect(
        page.getByText('Settings').first(),
      ).toBeVisible()
    },
  )

  test(
    '"Back to Site" link is visible in the sidebar',
    async ({ page }) => {
      await expect(
        page.getByTestId('admin-back-to-site'),
      ).toBeVisible()
    },
  )
})

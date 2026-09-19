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
    'clicking ACL nav item navigates to acl page',
    async ({ page }) => {
      await page
        .getByTestId('admin-nav-acl')
        .click()
      await expect(page).toHaveURL(
        new RegExp(
          `/site/${SITE_SLUG}/admin/acl`,
        ),
      )
      await expect(
        page.getByTestId('admin-acl-page'),
      ).toBeVisible()
    },
  )

  test(
    'clicking Files nav item navigates to files page',
    async ({ page }) => {
      await page
        .getByTestId('admin-nav-files')
        .click()
      await expect(page).toHaveURL(
        new RegExp(
          `/site/${SITE_SLUG}/admin/files`,
        ),
      )
      await expect(
        page.getByTestId('admin-files-page'),
      ).toBeVisible()
    },
  )

  test(
    'clicking Analytics nav item navigates to analytics page',
    async ({ page }) => {
      await page
        .getByTestId('admin-nav-analytics')
        .click()
      await expect(page).toHaveURL(
        new RegExp(
          `/site/${SITE_SLUG}/admin/analytics`,
        ),
      )
      await expect(
        page.getByRole('heading', {
          name: /analytics dashboard/i,
        }),
      ).toBeVisible()
    },
  )
})

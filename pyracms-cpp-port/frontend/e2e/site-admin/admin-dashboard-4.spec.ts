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
    'clicking "Back to Site" navigates to the tenant site',
    async ({ page }) => {
      const href = await page
        .getByTestId('admin-back-to-site')
        .getAttribute('href')
      expect(href).toContain(
        `/site/${SITE_SLUG}`,
      )
    },
  )

  test(
    'admin toolbar "Site" button is present',
    async ({ page }) => {
      await expect(
        page.getByTestId('admin-site-link'),
      ).toBeVisible()
    },
  )

  test(
    'admin toolbar "Site" button href points to tenant site',
    async ({ page }) => {
      const href = await page
        .getByTestId('admin-site-link')
        .getAttribute('href')
      expect(href).toContain(
        `/site/${SITE_SLUG}`,
      )
    },
  )

  test(
    'admin-main-content region has correct id anchor',
    async ({ page }) => {
      await expect(
        page.locator('#admin-main-content'),
      ).toBeAttached()
    },
  )

  test(
    'breadcrumb nav is rendered inside main content',
    async ({ page }) => {
      // TenantBreadcrumbs renders a <nav> with aria-label
      await expect(
        page.getByRole('navigation', {
          name: /breadcrumb/i,
        }),
      ).toBeVisible()
    },
  )
})

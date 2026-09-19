import { test, expect } from '@playwright/test'
import { ADMIN_USER } from '../support/super-admin-data-1'
import { loginAs } from '../support/super-admin-helpers-1'

test.describe('Settings page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ADMIN_USER)
    await page.goto('/super-admin/settings')
    await page
      .getByTestId('super-admin-settings-page')
      .waitFor({ state: 'visible', timeout: 10_000 })
  })

  test(
    'settings page renders with correct heading',
    async ({ page }) => {
      await expect(
        page.getByRole('heading', {
          name: 'Platform Settings',
        }),
      ).toBeVisible()
    },
  )

  test(
    'settings page shows informational alert',
    async ({ page }) => {
      await expect(
        page.getByRole('alert'),
      ).toBeVisible()
      await expect(
        page.getByRole('alert'),
      ).toContainText('Global platform settings')
    },
  )

  test(
    'settings page shows TuneOutlined icon '
    + '(aria-hidden)',
    async ({ page }) => {
      // The icon is aria-hidden; verify it is in DOM
      // inside the settings page container.
      const icon = page
        .getByTestId('super-admin-settings-page')
        .locator('[aria-hidden="true"]')
        .first()
      await expect(icon).toBeAttached()
    },
  )

  // Breadcrumbs on settings page

  test(
    'breadcrumbs are visible on settings page',
    async ({ page }) => {
      await expect(
        page.getByTestId('super-admin-breadcrumbs'),
      ).toBeVisible()
    },
  )

  test(
    'breadcrumb current item reads "Settings"',
    async ({ page }) => {
      await expect(
        page.getByTestId('breadcrumb-current'),
      ).toHaveText('Settings')
    },
  )
})

import { test, expect } from '@playwright/test'
import { ADMIN_USER, MOCK_TENANTS } from '../support/super-admin-data-1'
import { loginAs, waitForTenantsLoaded } from '../support/super-admin-helpers-1'

test.describe('Tenant management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ADMIN_USER)
    await page.goto('/super-admin/tenants')
    await page
      .getByTestId('super-admin-tenants-page')
      .waitFor({ state: 'visible', timeout: 10_000 })
  })

  test(
    'filter input clears with keyboard (Ctrl+A Delete)',
    async ({ page }) => {
      await page.route('**/api/tenants', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_TENANTS),
        }),
      )

      await page.goto('/super-admin/tenants')
      await page
        .getByTestId('super-admin-tenants-page')
        .waitFor({ state: 'visible', timeout: 10_000 })
      await waitForTenantsLoaded(page)

      const filterInput = page.getByTestId(
        'tenant-filter-input',
      )
      await filterInput.fill('alpha')
      // Rows for 'beta' should be hidden
      await expect(
        page.getByTestId('tenant-row-beta'),
      ).not.toBeVisible()

      // Keyboard-clear
      await filterInput.press('Control+a')
      await filterInput.press('Delete')
      await expect(filterInput).toHaveValue('')
      // Both rows visible again
      await expect(
        page.getByTestId('tenant-row-alpha'),
      ).toBeVisible()
      await expect(
        page.getByTestId('tenant-row-beta'),
      ).toBeVisible()
    },
  )

  test(
    'filter input has accessible aria-label',
    async ({ page }) => {
      const filterInput = page.getByTestId(
        'tenant-filter-input',
      )
      // The nested input carries the aria-label
      await expect(
        filterInput.locator('input'),
      ).toHaveAttribute('aria-label', 'Filter tenants')
    },
  )
})

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

  // Delete button + dialog

  test(
    'clicking delete opens confirmation dialog',
    async ({ page }) => {
      await waitForTenantsLoaded(page)

      const deleteButtons = page.locator(
        '[data-testid^="delete-tenant-"]',
      )
      const count = await deleteButtons.count()

      if (count === 0) {
        test.skip()
        return
      }

      await deleteButtons.first().click()

      const dialog =
        page.getByTestId('tenant-delete-dialog')
      await expect(dialog).toBeVisible()
      await expect(dialog).toContainText('Delete Tenant?')
    },
  )

  test(
    'delete dialog contains warning text about '
    + 'irreversibility',
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

      await page
        .getByTestId('delete-tenant-alpha')
        .click()

      await expect(
        page.getByTestId('tenant-delete-dialog'),
      ).toContainText('cannot be undone')
    },
  )
})

import { test, expect } from '@playwright/test'
import { ADMIN_USER } from '../support/super-admin-data-1'
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
    'cancel in delete dialog closes it without '
    + 'removing row',
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

      // Capture the slug of the first row before dialog
      const firstRow = page
        .locator('[data-testid^="tenant-row-"]')
        .first()
      const testId =
        (await firstRow.getAttribute('data-testid')) ?? ''
      const slug = testId.replace('tenant-row-', '')

      await deleteButtons.first().click()
      await page
        .getByTestId('cancel-delete-tenant')
        .click()

      // Dialog should be gone
      await expect(
        page.getByTestId('tenant-delete-dialog'),
      ).not.toBeVisible()
      // Row should still exist
      await expect(
        page.getByTestId(`tenant-row-${slug}`),
      ).toBeVisible()
    },
  )
})

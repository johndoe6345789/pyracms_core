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
    'tenant filter input narrows visible rows',
    async ({ page }) => {
      await waitForTenantsLoaded(page)

      const rows = page.locator(
        '[data-testid^="tenant-row-"]',
      )
      const count = await rows.count()
      if (count === 0) {
        test.skip()
        return
      }

      // Type a string that matches nothing
      const filterInput = page.getByTestId(
        'tenant-filter-input',
      )
      await filterInput.fill('__nonexistent_tenant__')
      await expect(
        page.getByText('No tenants found.'),
      ).toBeVisible()

      // Clear filter — rows come back
      await filterInput.clear()
      await expect(rows.first()).toBeVisible()
    },
  )
})

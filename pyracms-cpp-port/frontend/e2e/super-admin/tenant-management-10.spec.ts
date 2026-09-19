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
    'no-match empty state shows "No tenants found."',
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
      await filterInput.fill('__no_match__')
      await expect(
        page.getByText('No tenants found.'),
      ).toBeVisible()
    },
  )

  test(
    'confirm delete removes tenant from the list',
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

      const firstRow = page
        .locator('[data-testid^="tenant-row-"]')
        .first()
      const testId =
        (await firstRow.getAttribute('data-testid')) ?? ''
      const slug = testId.replace('tenant-row-', '')

      await deleteButtons.first().click()
      await page
        .getByTestId('confirm-delete-tenant')
        .click()

      // Dialog closes and the row disappears
      await expect(
        page.getByTestId('tenant-delete-dialog'),
      ).not.toBeVisible()
      await expect(
        page.getByTestId(`tenant-row-${slug}`),
      ).not.toBeVisible()
    },
  )
})

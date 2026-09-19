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
    'at least one tenant-row-* is visible when '
    + 'tenants exist',
    async ({ page }) => {
      await waitForTenantsLoaded(page)

      const rows = page.locator(
        '[data-testid^="tenant-row-"]',
      )
      const count = await rows.count()

      if (count === 0) {
        // No tenants seeded — verify empty-state text
        await expect(
          page.getByText('No tenants found.'),
        ).toBeVisible()
      } else {
        await expect(rows.first()).toBeVisible()
      }
    },
  )

  // Open Site link

  test(
    '"Open Site" icon button links to /site/{slug}',
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

      const openBtn = page.getByTestId('open-tenant-alpha')
      await expect(openBtn).toBeVisible()
      await expect(openBtn).toHaveAttribute(
        'href',
        '/site/alpha',
      )
    },
  )
})

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

  test('"Open Site" button has accessible aria-label', async ({ page }) => {
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

    await expect(page.getByTestId('open-tenant-alpha')).toHaveAttribute(
      'aria-label',
      'Open Alpha',
    )
  })

  test('"Open Site" button navigates to /site/{slug}', async ({ page }) => {
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

    await page.getByTestId('open-tenant-alpha').click()
    await expect(page).toHaveURL(/\/site\/alpha/)
  })
})

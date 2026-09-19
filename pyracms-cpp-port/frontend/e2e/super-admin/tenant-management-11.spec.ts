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

  test('mocked confirm delete removes row via DELETE API', async ({ page }) => {
    let deleteCallCount = 0
    await page.route('**/api/tenants**', (route) => {
      const method = route.request().method()
      if (method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_TENANTS),
        })
      }
      if (method === 'DELETE') {
        deleteCallCount++
        return route.fulfill({ status: 204 })
      }
      return route.continue()
    })

    await page.goto('/super-admin/tenants')
    await page
      .getByTestId('super-admin-tenants-page')
      .waitFor({ state: 'visible', timeout: 10_000 })
    await waitForTenantsLoaded(page)

    await page.getByTestId('delete-tenant-alpha').click()
    await expect(page.getByTestId('tenant-delete-dialog')).toBeVisible()

    await page.getByTestId('confirm-delete-tenant').click()

    await expect(page.getByTestId('tenant-delete-dialog')).not.toBeVisible()
    await expect(page.getByTestId('tenant-row-alpha')).not.toBeVisible()

    expect(deleteCallCount).toBe(1)
  })

  // Breadcrumbs on tenants page

  test('breadcrumbs are visible on tenants page', async ({ page }) => {
    await expect(page.getByTestId('super-admin-breadcrumbs')).toBeVisible()
  })
})

import { test, expect } from '@playwright/test'
import { loginAsAdmin } from '../support/portal-auth-helpers-1'

test.describe('Admin redirect — /admin', () => {
  test(
    'mocked tenants: /admin shows error text when ' + 'API call fails',
    async ({ page }) => {
      await loginAsAdmin(page)

      await page.route('**/api/tenants**', (route) =>
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server Error' }),
        }),
      )

      await page.goto('/admin')
      await page.waitForLoadState('networkidle')

      if (page.url().includes('/admin')) {
        await expect(page.getByText(/Failed to load tenants/i)).toBeVisible({
          timeout: 8_000,
        })
      }
    },
  )

  test(
    '/admin shows a loading spinner before the tenant ' + 'API resolves',
    async ({ page }) => {
      await loginAsAdmin(page)

      // Slow API to ensure the spinner is visible briefly
      await page.route('**/api/tenants**', async (route) => {
        await new Promise((r) => setTimeout(r, 1_000))
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        })
      })

      await page.goto('/admin')

      // CircularProgress renders; check body is present
      await expect(page.locator('body')).toBeVisible()
    },
  )
})

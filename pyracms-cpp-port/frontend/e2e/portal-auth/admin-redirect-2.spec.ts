import { test, expect } from '@playwright/test'
import { loginAsAdmin } from '../support/portal-auth-helpers-1'

test.describe('Admin redirect — /admin', () => {
  test(
    'authenticated admin visiting /admin is redirected ' +
      'to a tenant admin dashboard or shown no-tenant error',
    async ({ page }) => {
      await loginAsAdmin(page)
      await page.goto('/admin')

      // The app may redirect to /site/<slug>/admin or display
      // a "No tenants found" message — both are valid.
      await page.waitForLoadState('networkidle')

      const onAdminRoute =
        page.url().includes('/admin') ||
        page.url().match(/\/site\/[^/]+\/admin/)

      const noTenantText = page.getByText(/No tenants found/i)
      const adminDashboard = page.locator(
        '[data-testid*="admin-dashboard"],' +
          '[data-testid*="admin-panel"],' +
          '[data-testid*="admin-layout"]',
      )

      if (onAdminRoute) {
        // Either an admin panel or no-tenant message is shown.
        await Promise.race([
          expect(adminDashboard.first()).toBeVisible({
            timeout: 8_000,
          }),
          expect(noTenantText).toBeVisible({
            timeout: 8_000,
          }),
        ])
      } else {
        // Redirected elsewhere — confirm we're not on login.
        expect(page.url()).not.toContain('/auth/login')
      }
    },
  )

  test(
    'authenticated admin: /admin does not display the ' + 'login form',
    async ({ page }) => {
      await loginAsAdmin(page)
      await page.goto('/admin')
      await page.waitForLoadState('networkidle')

      // After successful auth the login form must not appear.
      await expect(page.getByTestId('login-submit')).not.toBeVisible()
    },
  )
})

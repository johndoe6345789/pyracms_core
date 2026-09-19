import { test, expect } from '@playwright/test'

test.describe('Direct URL access — unauthenticated', () => {
  const PROTECTED = [
    '/super-admin',
    '/super-admin/tenants',
    '/super-admin/users',
    '/super-admin/settings',
  ]

  for (const path of PROTECTED) {
    test(`${path} shows Access Denied without a session`, async ({ page }) => {
      await page.goto(path)
      await page
        .locator(
          '[data-testid="super-admin-denied"],' +
            '[data-testid="super-admin-dashboard-title"]',
        )
        .first()
        .waitFor({ state: 'visible', timeout: 10_000 })

      await expect(page.getByTestId('super-admin-denied')).toBeVisible()
      await expect(page.getByTestId('super-admin-denied')).toContainText(
        'Access Denied',
      )
    })
  }
})

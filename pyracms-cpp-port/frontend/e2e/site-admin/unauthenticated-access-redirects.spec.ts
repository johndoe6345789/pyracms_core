import { test, expect } from '@playwright/test'
import { BASE } from '../support/site-admin-data-1'

test.describe('Unauthenticated access redirects', () => {
  const PROTECTED_PATHS = [
    '',
    '/users',
    '/settings',
    '/features',
    '/analytics',
    '/backup',
    '/files',
    '/menus',
    '/styles',
  ]

  for (const path of PROTECTED_PATHS) {
    const fullPath = `${BASE}${path}`
    test(`${fullPath} redirects unauthenticated users`, async ({ page }) => {
      await page.goto(fullPath)
      await page.waitForLoadState('networkidle')

      const currentUrl = page.url()
      const isOnLoginPage =
        currentUrl.includes('/auth/login') || currentUrl.includes('/login')

      const hasAuthGuard =
        (await page.getByText(/access denied/i).count()) > 0 ||
        (await page.getByText(/sign in/i).count()) > 0

      const redirected = isOnLoginPage || hasAuthGuard
      expect(redirected).toBe(true)
    })
  }
})

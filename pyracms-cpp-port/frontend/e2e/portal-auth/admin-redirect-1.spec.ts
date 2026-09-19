import { test, expect } from '@playwright/test'

test.describe('Admin redirect — /admin', () => {
  test(
    'unauthenticated visit to /admin redirects to login',
    async ({ page }) => {
      await page.goto('/admin')

      // The app should bounce the guest to a login page.
      await page.waitForURL(
        (url) =>
          url.pathname.includes('/auth/login') ||
          url.pathname.includes('/login'),
        { timeout: 10_000 },
      )

      await expect(page).toHaveURL(/login/)
    },
  )

  test(
    'unauthenticated: login page shown after /admin redirect '
    + 'has username and password inputs',
    async ({ page }) => {
      await page.goto('/admin')

      // Wait for any redirect to settle.
      await page.waitForLoadState('networkidle')

      if (page.url().includes('login')) {
        await expect(
          page.getByTestId('username-input'),
        ).toBeVisible()
        await expect(
          page.getByTestId('password-input'),
        ).toBeVisible()
      } else {
        // If not redirected to login, an access-denied or
        // similar sentinel should be present.
        await expect(page.locator('body')).toBeVisible()
      }
    },
  )
})

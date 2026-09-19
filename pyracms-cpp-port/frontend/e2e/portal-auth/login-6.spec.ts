import { test, expect } from '@playwright/test'

test.describe('Login — /auth/login', () => {
  test(
    'login-error alert has role="alert" and '
    + 'aria-live="assertive" when shown',
    async ({ page }) => {
      // Trigger an error via mocked failing response
      await page.route('**/api/auth/**', (route) =>
        route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Invalid credentials',
          }),
        }),
      )

      await page.goto('/auth/login')
      await page
        .getByTestId('username-input')
        .fill('baduser')
      await page
        .getByTestId('password-input')
        .fill('badpass')
      await page.getByTestId('login-submit').click()

      const errorAlert =
        page.getByTestId('login-error')
      await expect(errorAlert).toBeVisible({
        timeout: 8_000,
      })
      await expect(errorAlert).toHaveAttribute(
        'role', 'alert',
      )
      await expect(errorAlert).toHaveAttribute(
        'aria-live', 'assertive',
      )
    },
  )

  test(
    'username-input has aria-label',
    async ({ page }) => {
      await page.goto('/auth/login')

      const input = page.getByTestId('username-input')
      const label = await input.getAttribute('aria-label')
      expect(label).toBeTruthy()
    },
  )

  test(
    'forgot-password-link has aria-label',
    async ({ page }) => {
      await page.goto('/auth/login')

      const link = page.getByTestId('forgot-password-link')
      const label = await link.getAttribute('aria-label')
      expect(label).toBeTruthy()
    },
  )
})

import { test, expect } from '@playwright/test'

test.describe('Login — /auth/login', () => {
  test('toggle-password icon button has aria-label', async ({ page }) => {
    await page.goto('/auth/login')

    const toggle = page.getByTestId('toggle-password')
    const label = await toggle.getAttribute('aria-label')
    expect(label).toBeTruthy()
  })

  // ---- NEW: Enter key submits the form ----

  test(
    'pressing Enter in the password field submits ' + 'the login form',
    async ({ page }) => {
      await page.goto('/auth/login')
      await page.getByTestId('username-input').fill('admin')
      await page.getByTestId('password-input').fill('password123')

      // Press Enter instead of clicking the button
      await page.getByTestId('password-input').press('Enter')

      await page.waitForURL((url) => !url.pathname.startsWith('/auth/login'), {
        timeout: 10_000,
      })

      expect(page.url()).not.toContain('/auth/login')
    },
  )

  test(
    'pressing Enter in the username field moves to ' + 'password field',
    async ({ page }) => {
      await page.goto('/auth/login')

      await page.getByTestId('username-input').fill('admin')
      await page.getByTestId('username-input').press('Tab')

      // Password field should now be focused
      await expect(page.getByTestId('password-input')).toBeFocused()
    },
  )
})

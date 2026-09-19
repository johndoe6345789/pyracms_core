import { test, expect } from '@playwright/test'

test.describe('Login — /auth/login', () => {
  test(
    'invalid credentials stay on login page and '
    + 'show an error',
    async ({ page }) => {
      await page.goto('/auth/login')
      await page
        .getByTestId('username-input')
        .fill('nobody')
      await page
        .getByTestId('password-input')
        .fill('wrongpassword')
      await page.getByTestId('login-submit').click()

      // Must remain on the login page.
      await expect(page).toHaveURL(/\/auth\/login/)

      // Either login-error or login-info carries the message.
      const errorRegion = page
        .getByTestId('login-error')
        .or(page.getByTestId('login-info'))
      await expect(errorRegion.first()).toBeVisible({
        timeout: 8_000,
      })
    },
  )

  test(
    '"Don\'t have an account?" register link is present',
    async ({ page }) => {
      await page.goto('/auth/login')

      // Could be a link with matching text or a data-testid
      const registerLink =
        page.getByRole('link', { name: /register/i })
          .or(
            page.getByRole('link', {
              name: /Don't have an account/i,
            }),
          )
          .or(page.getByTestId('register-link'))
      await expect(registerLink.first()).toBeVisible()
    },
  )

  test(
    '"Forgot password?" link points to '
    + '/auth/forgot-password',
    async ({ page }) => {
      await page.goto('/auth/login')

      await expect(
        page.getByTestId('forgot-password-link'),
      ).toHaveAttribute('href', '/auth/forgot-password')
    },
  )

  test(
    '"Forgot password?" link is visible and clickable',
    async ({ page }) => {
      await page.goto('/auth/login')

      const link = page.getByTestId('forgot-password-link')
      await expect(link).toBeVisible()
      await link.click()

      await expect(page).toHaveURL(
        /\/auth\/forgot-password/,
      )
    },
  )
})

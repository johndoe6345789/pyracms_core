import { test, expect } from '@playwright/test'
import { fillRegisterForm } from '../support/portal-auth-helpers-1'

test.describe('Register — /auth/register', () => {
  test(
    '"Already have an account?" login link is present',
    async ({ page }) => {
      await page.goto('/auth/register')

      const loginLink =
        page.getByRole('link', { name: /login/i })
          .or(
            page.getByRole('link', {
              name: /Already have an account/i,
            }),
          )
          .or(page.getByTestId('login-link'))
      await expect(loginLink.first()).toBeVisible()
    },
  )

  test(
    '"Already have an account?" link navigates to '
    + '/auth/login',
    async ({ page }) => {
      await page.goto('/auth/register')

      const loginLink =
        page.getByRole('link', { name: /login/i })
          .or(
            page.getByRole('link', {
              name: /Already have an account/i,
            }),
          )
          .or(page.getByTestId('login-link'))

      await loginLink.first().click()

      await expect(page).toHaveURL(/\/auth\/login/)
    },
  )

  test(
    'duplicate username shows register-error',
    async ({ page }) => {
      await page.goto('/auth/register')

      // "admin" is expected to be seeded and already taken.
      await fillRegisterForm(page, {
        username: 'admin',
        email: 'admin_dup@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        firstName: 'Admin',
        lastName: 'Dup',
      })

      await page.getByTestId('register-submit').click()

      await expect(page).toHaveURL(/\/auth\/register/)
      await expect(
        page.getByTestId('register-error'),
      ).toBeVisible({ timeout: 8_000 })
    },
  )
})

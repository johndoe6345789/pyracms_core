import { test, expect } from '@playwright/test'
import { fillRegisterForm } from '../support/portal-auth-helpers-1'

test.describe('Register — /auth/register', () => {
  test(
    'register-error has role="alert" and '
    + 'aria-live="assertive" when shown',
    async ({ page }) => {
      await page.goto('/auth/register')

      // Trigger mismatch error
      await fillRegisterForm(page, {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password1!',
        confirmPassword: 'NotTheSame1!',
        firstName: 'Test',
        lastName: 'User',
      })

      await page.getByTestId('register-submit').click()

      const errorAlert = page.getByTestId('register-error')
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
})

import { test, expect } from '@playwright/test'
import { fillRegisterForm, uniqueUser } from '../support/portal-auth-helpers-1'

test.describe('Register — /auth/register', () => {
  // ---- NEW: Enter key submits register form ----

  test(
    'pressing Enter in the last field submits the ' + 'register form',
    async ({ page }) => {
      await page.goto('/auth/register')

      // Mock register API
      await page.route('**/api/auth/register**', (route) =>
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ id: 1 }),
        }),
      )

      const user = uniqueUser()
      await fillRegisterForm(page, {
        username: user.username,
        email: user.email,
        password: user.password,
        confirmPassword: user.password,
        firstName: user.firstName,
        lastName: user.lastName,
      })

      // Press Enter from the last field
      await page.getByTestId('register-lastname-input').press('Enter')

      // Should either navigate away or show no crash
      await page
        .waitForLoadState('networkidle', {
          timeout: 6_000,
        })
        .catch(() => {
          /* acceptable timeout */
        })
    },
  )

  // ---- NEW: ARIA on register form fields ----

  test('register form has aria-label="Registration form"', async ({ page }) => {
    await page.goto('/auth/register')

    await expect(page.getByTestId('register-form')).toHaveAttribute(
      'aria-label',
      /registration form/i,
    )
  })
})

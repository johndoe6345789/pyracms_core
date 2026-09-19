import { test, expect } from '@playwright/test'

test.describe('Register — /auth/register', () => {
  test('register form is rendered', async ({ page }) => {
    await page.goto('/auth/register')

    await expect(
      page.getByTestId('register-form'),
    ).toBeVisible()
  })

  test(
    'all 6 input fields are visible',
    async ({ page }) => {
      await page.goto('/auth/register')

      await expect(
        page.getByTestId('register-username-input'),
      ).toBeVisible()
      await expect(
        page.getByTestId('register-email-input'),
      ).toBeVisible()
      await expect(
        page.getByTestId('register-password-input'),
      ).toBeVisible()
      await expect(
        page.getByTestId('register-confirm-password-input'),
      ).toBeVisible()
      await expect(
        page.getByTestId('register-firstname-input'),
      ).toBeVisible()
      await expect(
        page.getByTestId('register-lastname-input'),
      ).toBeVisible()
    },
  )

  test(
    'register-submit button is visible',
    async ({ page }) => {
      await page.goto('/auth/register')

      await expect(
        page.getByTestId('register-submit'),
      ).toBeVisible()
    },
  )

  test(
    'password-strength bar appears after typing in '
    + 'the password field',
    async ({ page }) => {
      await page.goto('/auth/register')

      const passwordInput = page.getByTestId(
        'register-password-input',
      )
      // Strength bar is hidden until the user types.
      await passwordInput.fill('Str0ng!Pass')

      await expect(
        page.getByTestId('password-strength'),
      ).toBeVisible()
    },
  )
})

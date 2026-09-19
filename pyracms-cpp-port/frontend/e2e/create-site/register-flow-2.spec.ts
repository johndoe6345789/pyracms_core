import { test, expect } from '@playwright/test'

test.describe(
  'Register flow — /auth/register/create-site',
  () => {
    test(
      'all register inputs accept typed text',
      async ({ page }) => {
        await page.goto('/auth/register/create-site')

        await page
          .getByTestId('register-username-input')
          .fill('jane')
        await expect(
          page.getByTestId('register-username-input'),
        ).toHaveValue('jane')

        await page
          .getByTestId('register-email-input')
          .fill('jane@example.com')
        await expect(
          page.getByTestId('register-email-input'),
        ).toHaveValue('jane@example.com')

        await page
          .getByTestId('register-password-input')
          .fill('Secret1!')
        await expect(
          page.getByTestId('register-password-input'),
        ).toHaveValue('Secret1!')

        await page
          .getByTestId('register-confirm-password-input')
          .fill('Secret1!')
        await expect(
          page.getByTestId(
            'register-confirm-password-input',
          ),
        ).toHaveValue('Secret1!')

        await page
          .getByTestId('register-firstname-input')
          .fill('Jane')
        await expect(
          page.getByTestId('register-firstname-input'),
        ).toHaveValue('Jane')

        await page
          .getByTestId('register-lastname-input')
          .fill('Doe')
        await expect(
          page.getByTestId('register-lastname-input'),
        ).toHaveValue('Doe')
      },
    )

    // Password strength bar tests

    test(
      'password-strength bar appears after typing',
      async ({ page }) => {
        await page.goto('/auth/register/create-site')
        await page
          .getByTestId('register-password-input')
          .fill('abc')
        await expect(
          page.getByTestId('password-strength'),
        ).toBeVisible()
      },
    )
  },
)

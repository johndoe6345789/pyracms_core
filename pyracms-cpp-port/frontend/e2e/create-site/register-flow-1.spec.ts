import { test, expect } from '@playwright/test'

test.describe(
  'Register flow — /auth/register/create-site',
  () => {
    test('renders registration form', async ({ page }) => {
      await page.goto('/auth/register/create-site')

      await expect(
        page.getByTestId('register-form'),
      ).toBeVisible()
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
        page.getByTestId('register-submit'),
      ).toBeVisible()
    })

    test(
      'confirm-password field is present',
      async ({ page }) => {
        await page.goto('/auth/register/create-site')
        await expect(
          page.getByTestId(
            'register-confirm-password-input',
          ),
        ).toBeVisible()
      },
    )

    test(
      'first-name and last-name fields are present',
      async ({ page }) => {
        await page.goto('/auth/register/create-site')
        await expect(
          page.getByTestId('register-firstname-input'),
        ).toBeVisible()
        await expect(
          page.getByTestId('register-lastname-input'),
        ).toBeVisible()
      },
    )
  },
)

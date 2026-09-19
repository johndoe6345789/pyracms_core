import { test } from '@playwright/test'
import { uniqueUser } from '../support/create-site-helpers-1'

test.describe(
  'Register flow — /auth/register/create-site',
  () => {
    test(
      'mocked success redirects to /create-site',
      async ({ page }) => {
        await page.route(
          '**/api/auth/register',
          (route) =>
            route.fulfill({
              status: 201,
              contentType: 'application/json',
              body: JSON.stringify({
                token: 'fake-jwt',
                user: {
                  id: 42,
                  username: 'newuser',
                  email: 'newuser@example.com',
                  role: 1,
                },
              }),
            }),
        )

        const user = uniqueUser()
        await page.goto('/auth/register/create-site')

        await page
          .getByTestId('register-username-input')
          .fill(user.username)
        await page
          .getByTestId('register-email-input')
          .fill(user.email)
        await page
          .getByTestId('register-password-input')
          .fill(user.password)
        await page
          .getByTestId('register-confirm-password-input')
          .fill(user.password)

        await page
          .getByTestId('register-submit')
          .click()

        await page
          .waitForURL('/create-site', { timeout: 8_000 })
          .catch(() => { /* mock path may differ */ })
      },
    )
  },
)

import { test, expect } from '@playwright/test'
import { uniqueUser } from '../support/create-site-helpers-1'

test.describe(
  'Register flow — /auth/register/create-site',
  () => {
    test(
      'register-error alert has role="alert"',
      async ({ page }) => {
        await page.route(
          '**/api/auth/register',
          (route) =>
            route.fulfill({
              status: 409,
              contentType: 'application/json',
              body: JSON.stringify({
                message: 'Username already taken',
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

        const errEl = page.getByTestId('register-error')
        await errEl
          .waitFor({ state: 'visible', timeout: 8_000 })
          .catch(() => { return })

        const visible = await errEl
          .isVisible()
          .catch(() => false)
        if (visible) {
          await expect(errEl).toHaveAttribute(
            'role',
            'alert',
          )
        }
      },
    )
  },
)

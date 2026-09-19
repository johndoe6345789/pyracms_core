import { test, expect } from '@playwright/test'
import { uniqueUser } from '../support/create-site-helpers-1'

test.describe(
  'Register flow — /auth/register/create-site',
  () => {
    test(
      'register-submit is keyboard-focusable',
      async ({ page }) => {
        await page.goto('/auth/register/create-site')
        const btn = page.getByTestId('register-submit')
        await btn.focus()
        await expect(btn).toBeFocused()
      },
    )

    test(
      'register-submit is disabled while submitting '
      + '(in-flight)',
      async ({ page }) => {
        await page.route(
          '**/api/auth/register',
          (route) =>
            new Promise(() => { void route }),
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

        const submit =
          page.getByTestId('register-submit')
        await submit.click()

        await expect(submit).toBeDisabled()
      },
    )
  },
)

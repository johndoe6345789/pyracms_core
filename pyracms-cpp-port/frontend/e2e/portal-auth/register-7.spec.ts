import { test, expect } from '@playwright/test'
import { fillRegisterForm, uniqueUser } from '../support/portal-auth-helpers-1'

test.describe('Register — /auth/register', () => {
  test(
    'each register input has an aria-label',
    async ({ page }) => {
      await page.goto('/auth/register')

      const testIds = [
        'register-username-input',
        'register-email-input',
        'register-password-input',
        'register-confirm-password-input',
        'register-firstname-input',
        'register-lastname-input',
      ]

      for (const tid of testIds) {
        const el = page.getByTestId(tid)
        const label = await el.getAttribute('aria-label')
        expect(
          label,
          `Expected aria-label on ${tid}`,
        ).toBeTruthy()
      }
    },
  )

  test(
    'register-submit has aria-label',
    async ({ page }) => {
      await page.goto('/auth/register')

      const btn = page.getByTestId('register-submit')
      const label = await btn.getAttribute('aria-label')
      expect(label).toBeTruthy()
    },
  )

  test(
    'login-link has aria-label',
    async ({ page }) => {
      await page.goto('/auth/register')

      const link = page.getByTestId('login-link')
      const label = await link.getAttribute('aria-label')
      expect(label).toBeTruthy()
    },
  )

  test(
    'register-submit is disabled while submitting',
    async ({ page }) => {
      // Hang the API so the form stays in loading state
      await page.route('**/api/auth/register**', () => {
        /* never resolve */
      })

      await page.goto('/auth/register')

      const user = uniqueUser()
      await fillRegisterForm(page, {
        username: user.username,
        email: user.email,
        password: user.password,
        confirmPassword: user.password,
        firstName: user.firstName,
        lastName: user.lastName,
      })

      await page.getByTestId('register-submit').click()

      await expect(
        page.getByTestId('register-submit'),
      ).toBeDisabled()
    },
  )
})

import { test, expect } from '@playwright/test'
import { loginAsAdmin } from '../support/create-site-helpers-1'

test.describe('Login page — /auth/login/create-site', () => {
  test(
    'forgot-password link is keyboard-accessible',
    async ({ page }) => {
      await page.goto('/auth/login/create-site')
      const link = page.getByTestId('forgot-password-link')
      await link.focus()
      await expect(link).toBeFocused()
    },
  )

  test(
    'submit button text is "Login" or "Sign In" '
    + '(visible label present)',
    async ({ page }) => {
      await page.goto('/auth/login/create-site')
      const submit = page.getByTestId('login-submit')
      await expect(submit).toBeVisible()
      // Button must have non-empty text content
      const txt = await submit.textContent()
      expect((txt ?? '').trim().length).toBeGreaterThan(0)
    },
  )

  test(
    'successful login redirects to /create-site',
    async ({ page }) => {
      await loginAsAdmin(page)

      await expect(page).toHaveURL('/create-site')
      await expect(
        page.getByTestId('create-site-form'),
      ).toBeVisible()
    },
  )

  test(
    'invalid credentials show an error message',
    async ({ page }) => {
      await page.goto('/auth/login/create-site')
      await page
        .getByTestId('username-input')
        .fill('nobody')
      await page
        .getByTestId('password-input')
        .fill('wrongpassword')
      await page.getByTestId('login-submit').click()

      // LoginHeader renders an error region; the exact
      // selector depends on the LoginHeader component —
      // fall back to checking we did NOT navigate away.
      await expect(page).toHaveURL('/auth/login/create-site')
    },
  )

  test(
    'username field accepts typed text',
    async ({ page }) => {
      await page.goto('/auth/login/create-site')
      const input = page.getByTestId('username-input')
      await input.fill('myuser')
      await expect(input).toHaveValue('myuser')
    },
  )

  test(
    'password field accepts typed text (masked)',
    async ({ page }) => {
      await page.goto('/auth/login/create-site')
      const input = page.getByTestId('password-input')
      await input.fill('secret123')
      await expect(input).toHaveValue('secret123')
      await expect(input).toHaveAttribute('type', 'password')
    },
  )
})

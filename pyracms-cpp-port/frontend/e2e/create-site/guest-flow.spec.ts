import { test, expect } from '@playwright/test'

test.describe('Guest flow — unauthenticated user', () => {
  test(
    'Create New Site button on portal navigates to '
    + '/auth/login/create-site',
    async ({ page }) => {
      await page.goto('/')

      const btn = page.getByTestId('create-site-button')
      await expect(btn).toBeVisible()

      // As a guest the href resolves to the login page.
      // Use click() so Next.js Link navigation is exercised.
      await btn.click()

      await expect(page).toHaveURL('/auth/login/create-site')
      await expect(
        page.getByTestId('login-form'),
      ).toBeVisible()
    },
  )

  test(
    'Visiting /create-site directly shows AuthPromptCard',
    async ({ page }) => {
      await page.goto('/create-site')

      const card = page.getByTestId('auth-prompt-card')
      await expect(card).toBeVisible()

      // "Sign In" button must link to the create-site login
      const signIn = page.getByTestId('prompt-login-button')
      await expect(signIn).toBeVisible()
      await expect(signIn).toHaveAttribute(
        'href',
        '/auth/login/create-site',
      )

      // "Register" button must also be present
      const register = page.getByTestId(
        'prompt-register-button',
      )
      await expect(register).toBeVisible()
      await expect(register).toHaveAttribute(
        'href',
        '/auth/register/create-site',
      )
    },
  )

  test(
    'Sign In button on AuthPromptCard navigates to '
    + 'the login page',
    async ({ page }) => {
      await page.goto('/create-site')
      await page.getByTestId('prompt-login-button').click()
      await expect(page).toHaveURL('/auth/login/create-site')
    },
  )

  test(
    'Register button on AuthPromptCard navigates to '
    + 'the register page',
    async ({ page }) => {
      await page.goto('/create-site')
      await page
        .getByTestId('prompt-register-button')
        .click()
      await expect(page).toHaveURL(
        '/auth/register/create-site',
      )
    },
  )
})

import { test, expect } from '@playwright/test'

test.describe('AuthPromptCard — element coverage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/create-site')
  })

  test('card heading reads "Sign in to Create a Site"', async ({ page }) => {
    await expect(
      page.getByRole('heading', {
        name: 'Sign in to Create a Site',
      }),
    ).toBeVisible()
  })

  test('lock icon is present (aria-hidden) inside the card', async ({
    page,
  }) => {
    // The LockOutlined SVG is aria-hidden; verify it
    // exists in the DOM inside the auth-prompt-card.
    const icon = page
      .getByTestId('auth-prompt-card')
      .locator('[aria-hidden="true"]')
      .first()
    await expect(icon).toBeAttached()
  })

  test('Sign In button has accessible aria-label', async ({ page }) => {
    await expect(page.getByTestId('prompt-login-button')).toHaveAttribute(
      'aria-label',
      'Sign in to your account',
    )
  })

  test('Register button has accessible aria-label', async ({ page }) => {
    await expect(page.getByTestId('prompt-register-button')).toHaveAttribute(
      'aria-label',
      'Create a new account',
    )
  })

  test('Sign In button is keyboard-focusable and activatable', async ({
    page,
  }) => {
    const btn = page.getByTestId('prompt-login-button')
    await btn.focus()
    await expect(btn).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL('/auth/login/create-site')
  })
})

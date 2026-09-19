import { test, expect } from '@playwright/test'

test.describe('AuthPromptCard — element coverage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/create-site')
  })

  test('Register button is keyboard-focusable and activatable', async ({
    page,
  }) => {
    const btn = page.getByTestId('prompt-register-button')
    await btn.focus()
    await expect(btn).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL('/auth/register/create-site')
  })

  test('card region has aria-label "Authentication required"', async ({
    page,
  }) => {
    await expect(
      page.getByRole('region', {
        name: 'Authentication required',
      }),
    ).toBeVisible()
  })

  test('body text describes account requirement', async ({ page }) => {
    await expect(page.getByTestId('auth-prompt-card')).toContainText(
      'You need an account',
    )
  })
})

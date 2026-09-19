import { test, expect } from '@playwright/test'

test.describe('Register flow — /auth/register/create-site', () => {
  test(
    '"Login" link on register page navigates to ' + '/auth/login',
    async ({ page }) => {
      await page.goto('/auth/register/create-site')
      await page.getByTestId('login-link').click()
      await expect(page).toHaveURL('/auth/login')
    },
  )

  test('"Login" link is keyboard-activatable', async ({ page }) => {
    await page.goto('/auth/register/create-site')
    const link = page.getByTestId('login-link')
    await link.focus()
    await expect(link).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL('/auth/login')
  })
})

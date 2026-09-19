import { test, expect } from '@playwright/test'

test.describe('Login page — /auth/login/create-site', () => {
  test('renders login form', async ({ page }) => {
    await page.goto('/auth/login/create-site')

    await expect(page.getByTestId('login-form')).toBeVisible()
    await expect(page.getByTestId('username-input')).toBeVisible()
    await expect(page.getByTestId('password-input')).toBeVisible()
    await expect(page.getByTestId('login-submit')).toBeVisible()
  })

  test('toggle-password button reveals/hides password', async ({ page }) => {
    await page.goto('/auth/login/create-site')

    const pwInput = page.getByTestId('password-input')
    await expect(pwInput).toHaveAttribute('type', 'password')

    await page.getByTestId('toggle-password').click()
    await expect(pwInput).toHaveAttribute('type', 'text')

    await page.getByTestId('toggle-password').click()
    await expect(pwInput).toHaveAttribute('type', 'password')
  })

  test('toggle-password button aria-label changes with state', async ({
    page,
  }) => {
    await page.goto('/auth/login/create-site')

    const toggle = page.getByTestId('toggle-password')
    await expect(toggle).toHaveAttribute('aria-label', 'Show password')

    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-label', 'Hide password')
  })

  test(
    'forgot-password link points to ' + '/auth/forgot-password',
    async ({ page }) => {
      await page.goto('/auth/login/create-site')
      await expect(page.getByTestId('forgot-password-link')).toHaveAttribute(
        'href',
        '/auth/forgot-password',
      )
    },
  )
})

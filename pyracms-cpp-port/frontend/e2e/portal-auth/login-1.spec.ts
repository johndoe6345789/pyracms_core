import { test, expect } from '@playwright/test'

test.describe('Login — /auth/login', () => {
  test('login form is rendered', async ({ page }) => {
    await page.goto('/auth/login')

    // Either data-testid="login-form" or the role=form
    const form = page
      .getByTestId('login-form')
      .or(page.getByRole('form', { name: /login/i }))
    await expect(form.first()).toBeVisible()
  })

  test('username-input and password-input are visible', async ({ page }) => {
    await page.goto('/auth/login')

    await expect(page.getByTestId('username-input')).toBeVisible()
    await expect(page.getByTestId('password-input')).toBeVisible()
  })

  test('login-submit button is visible', async ({ page }) => {
    await page.goto('/auth/login')

    await expect(page.getByTestId('login-submit')).toBeVisible()
  })

  test('password field defaults to type="password"', async ({ page }) => {
    await page.goto('/auth/login')

    await expect(page.getByTestId('password-input')).toHaveAttribute(
      'type',
      'password',
    )
  })

  test('successful login navigates away from /auth/login', async ({ page }) => {
    await page.goto('/auth/login')
    await page.getByTestId('username-input').fill('admin')
    await page.getByTestId('password-input').fill('password123')
    await page.getByTestId('login-submit').click()

    await page.waitForURL((url) => !url.pathname.startsWith('/auth/login'), {
      timeout: 10_000,
    })

    // Simply confirm we left the login page.
    expect(page.url()).not.toContain('/auth/login')
  })
})

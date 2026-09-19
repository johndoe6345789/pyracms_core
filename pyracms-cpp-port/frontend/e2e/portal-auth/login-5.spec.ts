import { test, expect } from '@playwright/test'

test.describe('Login — /auth/login', () => {
  // ---- NEW: register-link navigates ----

  test('register-link navigates to /auth/register', async ({ page }) => {
    await page.goto('/auth/login')

    const link = page.getByTestId('register-link').or(
      page.getByRole('link', {
        name: /sign up/i,
      }),
    )

    await link.first().click()
    await expect(page).toHaveURL(/\/auth\/register/)
  })

  // ---- NEW: ARIA attributes ----

  test('login form has aria-label="Login form"', async ({ page }) => {
    await page.goto('/auth/login')

    await expect(page.getByTestId('login-form')).toHaveAttribute(
      'aria-label',
      /login form/i,
    )
  })

  test('login-submit button has an aria-label', async ({ page }) => {
    await page.goto('/auth/login')

    const submit = page.getByTestId('login-submit')
    const label = await submit.getAttribute('aria-label')
    expect(label).toBeTruthy()
  })

  test('login-info banner is visible on the login page', async ({ page }) => {
    await page.goto('/auth/login')

    await expect(page.getByTestId('login-info')).toBeVisible()
  })
})

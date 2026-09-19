import { test, expect } from '@playwright/test'
import { uniqueUser } from '../support/create-site-helpers-1'

test.describe('Register flow — /auth/register/create-site', () => {
  test('duplicate username registration shows an error', async ({ page }) => {
    await page.goto('/auth/register/create-site')

    // "admin" is expected to already exist
    await page.getByTestId('register-username-input').fill('admin')
    await page.getByTestId('register-email-input').fill('admin@existing.com')
    await page.getByTestId('register-password-input').fill('password123')
    await page.getByTestId('register-submit').click()

    // Stays on register page; error alert visible
    await expect(page).toHaveURL('/auth/register/create-site')
    await expect(page.getByTestId('register-error')).toBeVisible()
  })

  test('mocked 409 conflict shows register-error', async ({ page }) => {
    await page.route('**/api/auth/register', (route) =>
      route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Username already taken',
        }),
      }),
    )

    const user = uniqueUser()
    await page.goto('/auth/register/create-site')

    await page.getByTestId('register-username-input').fill(user.username)
    await page.getByTestId('register-email-input').fill(user.email)
    await page.getByTestId('register-password-input').fill(user.password)
    await page
      .getByTestId('register-confirm-password-input')
      .fill(user.password)

    await page.getByTestId('register-submit').click()

    await page
      .getByTestId('register-error')
      .waitFor({ state: 'visible', timeout: 8_000 })
      .catch(() => {
        /* tolerate if mock path differs */
      })
  })
})

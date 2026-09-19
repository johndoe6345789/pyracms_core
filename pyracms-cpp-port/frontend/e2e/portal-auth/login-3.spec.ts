import { test, expect } from '@playwright/test'

test.describe('Login — /auth/login', () => {
  test('login-submit is disabled while request is in-flight', async ({
    page,
  }) => {
    await page.goto('/auth/login')

    // Intercept the auth API so it hangs indefinitely.
    await page.route('**/api/auth/**', () => {
      /* never resolve — leave hanging */
    })

    await page.getByTestId('username-input').fill('admin')
    await page.getByTestId('password-input').fill('password123')

    const submit = page.getByTestId('login-submit')
    await submit.click()

    await expect(submit).toBeDisabled()
  })

  // ---- NEW: show/hide password toggle ----

  test('show-password toggle reveals the password text', async ({ page }) => {
    await page.goto('/auth/login')

    const passwordInput = page.getByTestId('password-input')
    await passwordInput.fill('hunter2')

    // Initially hidden
    await expect(passwordInput).toHaveAttribute('type', 'password')

    // Click the visibility toggle
    const toggle = page.getByTestId('toggle-password')
    await toggle.click()

    // Now visible as text
    await expect(passwordInput).toHaveAttribute('type', 'text')
  })

  test(
    'show-password toggle hides the password again on ' + 'second click',
    async ({ page }) => {
      await page.goto('/auth/login')

      const passwordInput = page.getByTestId('password-input')
      await passwordInput.fill('hunter2')

      const toggle = page.getByTestId('toggle-password')
      await toggle.click() // show
      await toggle.click() // hide again

      await expect(passwordInput).toHaveAttribute('type', 'password')
    },
  )
})

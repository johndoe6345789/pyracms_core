import { test, expect } from '@playwright/test'

test.describe('Register — /auth/register', () => {
  // ---- NEW: password strength label transitions ----

  test(
    'password-strength label shows "Weak" for a ' +
      'short lowercase-only password',
    async ({ page }) => {
      await page.goto('/auth/register')

      await page.getByTestId('register-password-input').fill('abc')

      const label = page.getByTestId('password-strength-label')
      // Score 0 → no label rendered; score 1 → "Weak"
      // "abc" is < 8 chars and has only lower: score = 1
      await expect(label).toHaveText(/Weak/i, {
        timeout: 4_000,
      })
    },
  )

  test(
    'password-strength label shows "Fair" for ' + 'a medium password',
    async ({ page }) => {
      await page.goto('/auth/register')

      // length≥8 + digit = score 2
      await page.getByTestId('register-password-input').fill('abcdefg1')

      await expect(page.getByTestId('password-strength-label')).toHaveText(
        /Fair/i,
        { timeout: 4_000 },
      )
    },
  )

  test(
    'password-strength label shows "Good" for a ' + 'medium-strong password',
    async ({ page }) => {
      await page.goto('/auth/register')

      // length≥8 + digit + lowercase = score 3
      await page.getByTestId('register-password-input').fill('abcdefg12')

      await expect(page.getByTestId('password-strength-label')).toHaveText(
        /Good/i,
        { timeout: 4_000 },
      )
    },
  )

  test(
    'password-strength label shows "Strong" for ' +
      'a fully-qualified password',
    async ({ page }) => {
      await page.goto('/auth/register')

      // length≥8 + digit + lower + upper = score 4
      await page.getByTestId('register-password-input').fill('Abcdefg12')

      await expect(page.getByTestId('password-strength-label')).toHaveText(
        /Strong/i,
        { timeout: 4_000 },
      )
    },
  )
})

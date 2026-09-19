import { test, expect } from '@playwright/test'

test.describe(
  'Register flow — /auth/register/create-site',
  () => {
    test(
      'password "abc" (3 chars) shows "Weak" strength',
      async ({ page }) => {
        await page.goto('/auth/register/create-site')
        await page
          .getByTestId('register-password-input')
          .fill('abc')
        // score=1: only lowercase criterion met
        await expect(
          page.getByTestId('password-strength-label'),
        ).toHaveText('Weak')
      },
    )

    test(
      'password "abcde123" shows "Fair" strength',
      async ({ page }) => {
        await page.goto('/auth/register/create-site')
        await page
          .getByTestId('register-password-input')
          .fill('abcde123')
        // score=3: length≥8 + digit + lowercase
        await expect(
          page.getByTestId('password-strength-label'),
        ).toHaveText('Good')
      },
    )

    test(
      'password "abcdeABC123" shows "Strong" strength',
      async ({ page }) => {
        await page.goto('/auth/register/create-site')
        await page
          .getByTestId('register-password-input')
          .fill('abcdeABC123')
        // score=4: length≥8 + digit + lower + upper
        await expect(
          page.getByTestId('password-strength-label'),
        ).toHaveText('Strong')
      },
    )

    test(
      'password-strength bar has role="status" and '
      + 'aria-live="polite"',
      async ({ page }) => {
        await page.goto('/auth/register/create-site')
        await page
          .getByTestId('register-password-input')
          .fill('test')
        const bar = page.getByTestId('password-strength')
        await expect(bar).toHaveAttribute('role', 'status')
        await expect(bar).toHaveAttribute(
          'aria-live',
          'polite',
        )
      },
    )

    test(
      'password-strength bar is hidden when password '
      + 'field is empty',
      async ({ page }) => {
        await page.goto('/auth/register/create-site')
        // Field starts empty — bar should not be in DOM
        await expect(
          page.getByTestId('password-strength'),
        ).not.toBeAttached()
      },
    )
  },
)

import { test, expect } from '@playwright/test'

test.describe('Portal — /', () => {
  // ---- NEW: portal-page role and aria-label ----

  test(
    'portal-page has role="main" and aria-label',
    async ({ page }) => {
      await page.goto('/')

      const root = page.getByTestId('portal-page')
      await expect(root).toHaveAttribute('role', 'main')
      await expect(root).toHaveAttribute(
        'aria-label',
        /portal homepage/i,
      )
    },
  )

  test(
    'create-site-button has an accessible aria-label',
    async ({ page }) => {
      await page.goto('/')

      const btn = page.getByTestId('create-site-button')
      // Unauthenticated: label describes sign-in intent
      const label = await btn.getAttribute('aria-label')
      expect(label).toBeTruthy()
    },
  )

  test(
    'portal-page "Available Sites" section heading is visible',
    async ({ page }) => {
      await page.goto('/')

      await expect(
        page.getByRole('heading', {
          name: /Available Sites/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    'create-site-button is keyboard-focusable (tabIndex)',
    async ({ page }) => {
      await page.goto('/')

      // Tab from body to reach the first focusable element;
      // confirm the button can receive focus.
      const btn = page.getByTestId('create-site-button')
      await btn.focus()
      await expect(btn).toBeFocused()
    },
  )
})

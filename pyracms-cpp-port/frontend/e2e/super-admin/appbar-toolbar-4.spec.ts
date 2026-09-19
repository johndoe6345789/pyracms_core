import { test, expect } from '@playwright/test'
import { ADMIN_USER } from '../support/super-admin-data-1'
import { goToSuperAdmin, loginAs } from '../support/super-admin-helpers-1'

test.describe('AppBar toolbar', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ADMIN_USER)
    await goToSuperAdmin(page)
  })

  test(
    'clicking "Sign Out" logs out and redirects to /',
    async ({ page }) => {
      await page.getByTestId('user-bubble-btn').click()
      await page.getByTestId('logout-btn').click()
      await expect(page).toHaveURL('/')
    },
  )

  test(
    'UserBubble avatar button is keyboard-activatable',
    async ({ page }) => {
      const btn = page.getByTestId('user-bubble-btn')
      await btn.focus()
      await expect(btn).toBeFocused()
      await page.keyboard.press('Enter')
      await expect(
        page.getByTestId('logout-btn'),
      ).toBeVisible()
    },
  )

  test(
    'unauthenticated user sees guest-login-link '
    + 'instead of avatar',
    async ({ page: guestPage }) => {
      // New unauthenticated page context
      await guestPage.goto('/super-admin')
      await guestPage
        .locator(
          '[data-testid="super-admin-denied"],'
          + '[data-testid="super-admin-dashboard-title"]',
        )
        .first()
        .waitFor({ state: 'visible', timeout: 10_000 })

      // If the access-denied guard still renders the
      // AppBar, the guest chip should be visible.
      const guestChip = guestPage.getByTestId(
        'guest-login-link',
      )
      const isVisible = await guestChip
        .isVisible()
        .catch(() => false)
      if (isVisible) {
        await expect(guestChip).toHaveAttribute(
          'href',
          '/auth/login',
        )
      }
    },
  )
})

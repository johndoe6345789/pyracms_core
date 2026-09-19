import { test, expect } from '@playwright/test'
import { SITE_SLUG } from '../support/site-admin-data-1'
import {
  goToAdmin,
  loginAsAdmin,
  mockApiRoutes,
} from '../support/site-admin-helpers-1'

test.describe('Keyboard navigation', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
    await loginAsAdmin(page)
    await goToAdmin(page)
  })

  test(
    'all sidebar nav items are individually focusable',
    async ({ page }) => {
      const navTestIds = [
        'admin-nav-dashboard',
        'admin-nav-users',
        'admin-nav-settings',
        'admin-nav-feature-toggles',
      ]
      for (const testId of navTestIds) {
        await page.getByTestId(testId).focus()
        await expect(
          page.getByTestId(testId),
        ).toBeFocused()
      }
    },
  )

  test(
    'Enter key on Users nav navigates to /users',
    async ({ page }) => {
      const usersNav = page.getByTestId(
        'admin-nav-users',
      )
      await usersNav.focus()
      await page.keyboard.press('Enter')
      await expect(page).toHaveURL(
        new RegExp(
          `/site/${SITE_SLUG}/admin/users`,
        ),
      )
    },
  )

  test(
    'skip-to-content link is present in DOM',
    async ({ page }) => {
      await expect(
        page.getByTestId('skip-to-content'),
      ).toBeAttached()
    },
  )

  test(
    'skip-to-content link becomes visible on focus',
    async ({ page }) => {
      const skip = page.getByTestId(
        'skip-to-content',
      )
      await skip.focus()
      // After focus, the element is repositioned
      // into the viewport via inline style
      await expect(skip).toBeVisible()
    },
  )
})

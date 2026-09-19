import { test, expect } from '@playwright/test'
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
    'skip-to-content href points to admin-main-content',
    async ({ page }) => {
      const href = await page
        .getByTestId('skip-to-content')
        .getAttribute('href')
      expect(href).toBe('#admin-main-content')
    },
  )

  test(
    'admin-site-link is keyboard focusable',
    async ({ page }) => {
      await page
        .getByTestId('admin-site-link')
        .focus()
      await expect(
        page.getByTestId('admin-site-link'),
      ).toBeFocused()
    },
  )

  test(
    'quick-link cards are keyboard focusable',
    async ({ page }) => {
      await page
        .getByTestId('quick-link-users')
        .focus()
      await expect(
        page.getByTestId('quick-link-users'),
      ).toBeFocused()
    },
  )
})

import { test, expect } from '@playwright/test'
import {
  goToAdmin,
  loginAsAdmin,
  mockApiRoutes,
} from '../support/site-admin-helpers-1'

test.describe('Admin sidebar navigation', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
    await loginAsAdmin(page)
    await goToAdmin(page)
  })

  test(
    '"Back to Site" link is visible in sidebar',
    async ({ page }) => {
      await expect(
        page.getByTestId('admin-back-to-site'),
      ).toBeVisible()
    },
  )

  test(
    '"Back to Site" link text reads "Back to Site"',
    async ({ page }) => {
      await expect(
        page.getByTestId('admin-back-to-site'),
      ).toContainText('Back to Site')
    },
  )

  test(
    'secondary navigation has aria-label',
    async ({ page }) => {
      await expect(
        page.getByRole('navigation', {
          name: /admin secondary navigation/i,
        }),
      ).toBeVisible()
    },
  )
})

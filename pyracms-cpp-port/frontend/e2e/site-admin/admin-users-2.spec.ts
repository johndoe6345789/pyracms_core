import { test, expect } from '@playwright/test'
import {
  goToAdmin,
  loginAsAdmin,
  mockApiRoutes,
} from '../support/site-admin-helpers-1'

test.describe('Admin Users', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
    await loginAsAdmin(page)
    await goToAdmin(page, '/users')
    await page
      .getByTestId('admin-users-page')
      .waitFor({ state: 'visible', timeout: 10_000 })
  })

  test(
    'user table shows username and email for each user',
    async ({ page }) => {
      await expect(
        page.getByText('admin'),
      ).toBeVisible()
      await expect(
        page.getByText('alice'),
      ).toBeVisible()
      await expect(
        page.getByText('admin@example.com'),
      ).toBeVisible()
    },
  )

  test(
    'edit-user action button is present for first user',
    async ({ page }) => {
      await expect(
        page.getByTestId('edit-user-1'),
      ).toBeVisible()
    },
  )

  test(
    'edit-user button has correct aria-label',
    async ({ page }) => {
      await expect(
        page.getByRole('button', {
          name: /edit user admin/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    'ban-user action button is present for first user',
    async ({ page }) => {
      await expect(
        page.getByTestId('ban-user-1'),
      ).toBeVisible()
    },
  )

  test(
    'ban-user button has aria-label for active user',
    async ({ page }) => {
      await expect(
        page.getByRole('button', {
          name: /ban admin/i,
        }),
      ).toBeVisible()
    },
  )
})

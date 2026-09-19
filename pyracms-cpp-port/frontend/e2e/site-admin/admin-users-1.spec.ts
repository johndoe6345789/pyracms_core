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
    'page loads — admin-users-page container visible',
    async ({ page }) => {
      await expect(
        page.getByTestId('admin-users-page'),
      ).toBeVisible()
    },
  )

  test(
    'page has "User Management" heading',
    async ({ page }) => {
      await expect(
        page.getByRole('heading', {
          name: /user management/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    'user table is rendered',
    async ({ page }) => {
      await expect(
        page.getByTestId('user-table'),
      ).toBeVisible()
    },
  )

  test(
    'user table has correct accessible label',
    async ({ page }) => {
      await expect(
        page.getByRole('table', {
          name: /user accounts/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    'user table shows mocked user rows',
    async ({ page }) => {
      // MOCK_USERS id=1 row
      await expect(
        page.getByTestId('user-row-1'),
      ).toBeVisible()
      // MOCK_USERS id=2 row
      await expect(
        page.getByTestId('user-row-2'),
      ).toBeVisible()
    },
  )
})

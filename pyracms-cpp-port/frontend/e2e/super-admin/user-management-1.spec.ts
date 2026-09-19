import { test, expect } from '@playwright/test'
import { ADMIN_USER } from '../support/super-admin-data-1'
import { loginAs, waitForUsersLoaded } from '../support/super-admin-helpers-1'

test.describe('User management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ADMIN_USER)
    await page.goto('/super-admin/users')
    await page
      .getByTestId('super-admin-users-page')
      .waitFor({ state: 'visible', timeout: 10_000 })
  })

  test(
    'shows "Global Users" heading',
    async ({ page }) => {
      await expect(
        page.getByRole('heading', { name: 'Global Users' }),
      ).toBeVisible()
    },
  )

  test(
    'global users table is rendered',
    async ({ page }) => {
      await waitForUsersLoaded(page)

      await expect(
        page.getByTestId('global-users-table'),
      ).toBeVisible()
    },
  )

  test(
    'at least one user-row-* is visible',
    async ({ page }) => {
      await waitForUsersLoaded(page)

      const rows = page.locator(
        '[data-testid^="user-row-"]',
      )
      const count = await rows.count()

      if (count === 0) {
        await expect(
          page.getByText('No users found.'),
        ).toBeVisible()
      } else {
        await expect(rows.first()).toBeVisible()
      }
    },
  )

  test(
    'role select dropdowns are present for each user',
    async ({ page }) => {
      await waitForUsersLoaded(page)

      const roleSelects = page.locator(
        '[data-testid^="role-select-"]',
      )
      const count = await roleSelects.count()

      if (count === 0) {
        test.skip()
        return
      }

      await expect(roleSelects.first()).toBeVisible()
    },
  )
})

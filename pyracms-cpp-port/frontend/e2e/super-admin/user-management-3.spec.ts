import { test, expect } from '@playwright/test'
import { ADMIN_USER, MOCK_USERS } from '../support/super-admin-data-1'
import { loginAs, waitForUsersLoaded } from '../support/super-admin-helpers-1'

test.describe('User management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ADMIN_USER)
    await page.goto('/super-admin/users')
    await page
      .getByTestId('super-admin-users-page')
      .waitFor({ state: 'visible', timeout: 10_000 })
  })

  test('active user row shows "Active" status chip', async ({ page }) => {
    await page.route('**/api/users', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_USERS),
      }),
    )

    await page.goto('/super-admin/users')
    await page
      .getByTestId('super-admin-users-page')
      .waitFor({ state: 'visible', timeout: 10_000 })
    await waitForUsersLoaded(page)

    const userRow = page.getByTestId('user-row-user1')
    await expect(userRow).toBeVisible()
    await expect(userRow).toContainText('Active')
  })

  // Role change

  test('role select has aria-label "Role for {username}"', async ({ page }) => {
    await page.route('**/api/users', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_USERS),
      }),
    )

    await page.goto('/super-admin/users')
    await page
      .getByTestId('super-admin-users-page')
      .waitFor({ state: 'visible', timeout: 10_000 })
    await waitForUsersLoaded(page)

    const select = page.getByTestId('role-select-user1')
    await expect(select).toBeVisible()
    // The inner <input> carries the aria-label
    await expect(select.locator('input')).toHaveAttribute(
      'aria-label',
      'Role for user1',
    )
  })
})

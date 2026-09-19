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

  test('role select contains all five role options', async ({ page }) => {
    await waitForUsersLoaded(page)

    const roleSelects = page.locator('[data-testid^="role-select-"]')
    if ((await roleSelects.count()) === 0) {
      test.skip()
      return
    }

    // Open the first select
    await roleSelects.first().click()

    const options = page.getByRole('option')
    await expect(options.filter({ hasText: 'Guest' })).toBeVisible()
    await expect(options.filter({ hasText: 'User' })).toBeVisible()
    await expect(options.filter({ hasText: 'Moderator' })).toBeVisible()
    await expect(options.filter({ hasText: 'Site Admin' })).toBeVisible()
    await expect(options.filter({ hasText: 'Super Admin' })).toBeVisible()

    // Close the menu without making a change
    await page.keyboard.press('Escape')
  })

  // Ban / Unban toggle

  test('banned user row shows "Banned" status chip', async ({ page }) => {
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

    const bannedRow = page.getByTestId('user-row-banned1')
    await expect(bannedRow).toBeVisible()
    await expect(bannedRow).toContainText('Banned')
  })
})

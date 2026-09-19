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

  test('mocked role change calls PUT /api/users/{id}', async ({ page }) => {
    let putBody: unknown = null
    await page.route('**/api/users**', (route) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_USERS),
        })
      }
      if (route.request().method() === 'PUT') {
        putBody = JSON.parse(route.request().postData() ?? '{}')
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({}),
        })
      }
      return route.continue()
    })

    await page.goto('/super-admin/users')
    await page
      .getByTestId('super-admin-users-page')
      .waitFor({ state: 'visible', timeout: 10_000 })
    await waitForUsersLoaded(page)

    // Open the role select for user1 (role=1)
    await page.getByTestId('role-select-user1').click()

    // Choose Moderator (role=2)
    await page.getByRole('option', { name: 'Moderator' }).click()

    // Give the PUT request time to fire
    await page.waitForTimeout(500)
    expect(putBody).not.toBeNull()
  })

  // Breadcrumbs on users page

  test('breadcrumbs are visible on users page', async ({ page }) => {
    await expect(page.getByTestId('super-admin-breadcrumbs')).toBeVisible()
  })

  test('breadcrumb current item reads "Users"', async ({ page }) => {
    await expect(page.getByTestId('breadcrumb-current')).toHaveText('Users')
  })
})

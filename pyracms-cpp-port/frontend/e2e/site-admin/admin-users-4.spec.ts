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

  test('"Create User" button is visible', async ({ page }) => {
    await expect(page.getByTestId('create-user-btn')).toBeVisible()
  })

  test('clicking "Create User" opens create-user dialog', async ({ page }) => {
    await page.getByTestId('create-user-btn').click()
    await expect(page.getByTestId('create-user-dialog')).toBeVisible()
  })

  test('create dialog has username, email, fullname, password inputs', async ({
    page,
  }) => {
    await page.getByTestId('create-user-btn').click()
    await expect(page.getByTestId('new-username-input')).toBeVisible()
    await expect(page.getByTestId('new-email-input')).toBeVisible()
    await expect(page.getByTestId('new-fullname-input')).toBeVisible()
    await expect(page.getByTestId('new-password-input')).toBeVisible()
  })

  test('submit button is disabled when fields are empty', async ({ page }) => {
    await page.getByTestId('create-user-btn').click()
    await expect(page.getByTestId('submit-create-btn')).toBeDisabled()
  })
})

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
    'submit button is enabled when required fields are filled',
    async ({ page }) => {
      await page
        .getByTestId('create-user-btn')
        .click()
      await page
        .getByTestId('new-username-input')
        .fill('newuser')
      await page
        .getByTestId('new-email-input')
        .fill('new@example.com')
      await page
        .getByTestId('new-password-input')
        .fill('secret123')
      await expect(
        page.getByTestId('submit-create-btn'),
      ).toBeEnabled()
    },
  )

  test(
    'cancel button in create dialog closes it',
    async ({ page }) => {
      await page
        .getByTestId('create-user-btn')
        .click()
      await expect(
        page.getByTestId('create-user-dialog'),
      ).toBeVisible()
      await page
        .getByTestId('cancel-create-btn')
        .click()
      await expect(
        page.getByTestId('create-user-dialog'),
      ).not.toBeVisible()
    },
  )

  test(
    'admin sidebar is present on users page',
    async ({ page }) => {
      await expect(
        page.getByTestId('admin-sidebar'),
      ).toBeVisible()
    },
  )
})

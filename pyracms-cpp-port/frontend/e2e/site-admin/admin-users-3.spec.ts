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

  test('delete-user action button is present for first user', async ({
    page,
  }) => {
    await expect(page.getByTestId('delete-user-1')).toBeVisible()
  })

  test('delete-user button has correct aria-label', async ({ page }) => {
    await expect(
      page.getByRole('button', {
        name: /delete user admin/i,
      }),
    ).toBeVisible()
  })

  test('clicking delete-user opens confirm dialog', async ({ page }) => {
    await page.getByTestId('delete-user-1').click()
    await expect(page.getByTestId('confirm-dialog')).toBeVisible()
  })

  test('confirm dialog cancel button closes it', async ({ page }) => {
    await page.getByTestId('delete-user-1').click()
    await expect(page.getByTestId('confirm-dialog')).toBeVisible()
    await page.getByTestId('confirm-cancel-btn').click()
    await expect(page.getByTestId('confirm-dialog')).not.toBeVisible()
  })

  test('confirm dialog has a destructive confirm button', async ({ page }) => {
    await page.getByTestId('delete-user-1').click()
    await expect(page.getByTestId('confirm-submit-btn')).toBeVisible()
  })
})

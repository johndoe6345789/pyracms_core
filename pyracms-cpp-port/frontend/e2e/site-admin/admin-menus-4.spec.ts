import { test, expect } from '@playwright/test'
import {
  goToAdmin,
  loginAsAdmin,
  mockApiRoutes,
} from '../support/site-admin-helpers-1'

test.describe('Admin Menus', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
    await loginAsAdmin(page)
    await goToAdmin(page, '/menus')
    await page
      .getByTestId('admin-menus-page')
      .waitFor({ state: 'visible', timeout: 10_000 })
  })

  test('create-group dialog submit button is disabled when empty', async ({
    page,
  }) => {
    await page
      .getByRole('button', {
        name: /new menu group/i,
      })
      .click()
    await expect(page.getByTestId('submit-group-btn')).toBeDisabled()
  })

  test('create-group submit enables when name typed', async ({ page }) => {
    await page
      .getByRole('button', {
        name: /new menu group/i,
      })
      .click()
    await page.getByTestId('group-name-input').fill('footer')
    await expect(page.getByTestId('submit-group-btn')).toBeEnabled()
  })

  test('cancel button in create-group dialog closes it', async ({ page }) => {
    await page
      .getByRole('button', {
        name: /new menu group/i,
      })
      .click()
    await page.getByTestId('cancel-group-btn').click()
    await expect(page.getByTestId('create-group-dialog')).not.toBeVisible()
  })

  test('mocked menu item row is visible in table', async ({ page }) => {
    await expect(page.getByText('Main Nav')).toBeVisible()
  })
})

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

  test('edit-row button is present for mocked menu item', async ({ page }) => {
    await expect(page.getByTestId('edit-row-btn')).toBeVisible()
  })

  test('clicking edit-row reveals save and cancel edit buttons', async ({
    page,
  }) => {
    await page.getByTestId('edit-row-btn').click()
    await expect(page.getByTestId('save-edit-btn')).toBeVisible()
    await expect(page.getByTestId('cancel-edit-btn')).toBeVisible()
  })

  test('cancel-edit-btn returns row to view mode', async ({ page }) => {
    await page.getByTestId('edit-row-btn').click()
    await page.getByTestId('cancel-edit-btn').click()
    await expect(page.getByTestId('edit-row-btn')).toBeVisible()
  })

  test('delete-row button is present for mocked menu item', async ({
    page,
  }) => {
    await expect(page.getByTestId('delete-row-btn')).toBeVisible()
  })

  test('admin sidebar is present on menus page', async ({ page }) => {
    await expect(page.getByTestId('admin-sidebar')).toBeVisible()
  })
})

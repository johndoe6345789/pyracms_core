import { test, expect } from '@playwright/test'
import {
  goToAdmin,
  loginAsAdmin,
  mockApiRoutes,
} from '../support/site-admin-helpers-1'

test.describe('Admin Settings', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
    await loginAsAdmin(page)
    await goToAdmin(page, '/settings')
    await page
      .getByTestId('admin-settings-page')
      .waitFor({ state: 'visible', timeout: 10_000 })
  })

  test(
    'cancel-setting-btn returns row to view mode',
    async ({ page }) => {
      await page
        .getByTestId('edit-setting-btn')
        .first()
        .click()
      await page
        .getByTestId('cancel-setting-btn')
        .click()
      await expect(
        page.getByTestId('edit-setting-btn').first(),
      ).toBeVisible()
    },
  )

  test(
    'delete-setting button is present for a row',
    async ({ page }) => {
      await expect(
        page.getByTestId('delete-setting-btn').first(),
      ).toBeVisible()
    },
  )

  test(
    'admin sidebar is present on settings page',
    async ({ page }) => {
      await expect(
        page.getByTestId('admin-sidebar'),
      ).toBeVisible()
    },
  )
})

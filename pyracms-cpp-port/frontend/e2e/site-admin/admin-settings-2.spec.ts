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

  test('"Add Setting" button enables when both fields filled', async ({
    page,
  }) => {
    await page.getByTestId('setting-key-input').fill('my_key')
    await page.getByTestId('setting-value-input').first().fill('my_value')
    await expect(page.getByTestId('add-setting-btn')).toBeEnabled()
  })

  test('settings table is rendered with mocked rows', async ({ page }) => {
    await expect(page.getByTestId('settings-table')).toBeVisible()
  })

  test('settings table shows mocked setting keys', async ({ page }) => {
    await expect(page.getByText('site_name')).toBeVisible()
    await expect(page.getByText('contact_email')).toBeVisible()
  })

  test('edit-setting button is present for a row', async ({ page }) => {
    await expect(page.getByTestId('edit-setting-btn').first()).toBeVisible()
  })

  test('clicking edit-setting reveals save and cancel buttons', async ({
    page,
  }) => {
    await page.getByTestId('edit-setting-btn').first().click()
    await expect(page.getByTestId('save-setting-btn')).toBeVisible()
    await expect(page.getByTestId('cancel-setting-btn')).toBeVisible()
  })
})

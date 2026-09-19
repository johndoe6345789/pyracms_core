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

  test('page loads — admin-settings-page container visible', async ({
    page,
  }) => {
    await expect(page.getByTestId('admin-settings-page')).toBeVisible()
  })

  test('page has "Settings" heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', {
        name: /^settings$/i,
      }),
    ).toBeVisible()
  })

  test('add-setting form is rendered', async ({ page }) => {
    await expect(page.getByTestId('add-setting-form')).toBeVisible()
  })

  test('setting key and value inputs are present', async ({ page }) => {
    await expect(page.getByTestId('setting-key-input')).toBeVisible()
    await expect(page.getByTestId('setting-value-input').first()).toBeVisible()
  })

  test('"Add Setting" button is visible', async ({ page }) => {
    await expect(page.getByTestId('add-setting-btn')).toBeVisible()
  })

  test('"Add Setting" button is disabled when inputs are empty', async ({
    page,
  }) => {
    await expect(page.getByTestId('add-setting-btn')).toBeDisabled()
  })
})

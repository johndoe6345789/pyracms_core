import { test, expect } from '@playwright/test'
import {
  goToAdmin,
  loginAsAdmin,
  mockApiRoutes,
} from '../support/site-admin-helpers-1'

test.describe('Admin Features', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
    await loginAsAdmin(page)
    await goToAdmin(page, '/features')
    await page
      .getByTestId('admin-features-page')
      .waitFor({ state: 'visible', timeout: 10_000 })
  })

  test('feature toggle for "forum" is unchecked (enabled=false)', async ({
    page,
  }) => {
    const toggle = page.getByTestId('feature-toggle-forum')
    await expect(toggle).toBeVisible()
    await expect(toggle).not.toBeChecked()
  })

  test('clicking forum toggle changes its checked state', async ({ page }) => {
    const toggle = page.getByTestId('feature-toggle-forum')
    await toggle.click()
    await expect(toggle).toBeChecked()
  })

  test('clicking articles toggle unchecks it', async ({ page }) => {
    const toggle = page.getByTestId('feature-toggle-articles')
    await toggle.click()
    await expect(toggle).not.toBeChecked()
  })

  test('clicking "Save Changes" does not cause JS error', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await page.getByTestId('save-features-btn').click()
    // Snackbar success message should appear
    await expect(page.getByText(/saved successfully/i)).toBeVisible({
      timeout: 5_000,
    })
    expect(errors).toHaveLength(0)
  })

  test('admin sidebar is present on features page', async ({ page }) => {
    await expect(page.getByTestId('admin-sidebar')).toBeVisible()
  })
})

import { test, expect } from '@playwright/test'
import {
  goToAdmin,
  loginAsAdmin,
  mockApiRoutes,
} from '../support/site-admin-helpers-1'

test.describe('Admin Files', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
    await loginAsAdmin(page)
    await goToAdmin(page, '/files')
    await page
      .getByTestId('admin-files-page')
      .waitFor({ state: 'visible', timeout: 10_000 })
  })

  test('page loads — admin-files-page container visible', async ({ page }) => {
    await expect(page.getByTestId('admin-files-page')).toBeVisible()
  })

  test('page has "File Manager" heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', {
        name: /file manager/i,
      }),
    ).toBeVisible()
  })

  test('upload dropzone is rendered', async ({ page }) => {
    await expect(page.getByTestId('upload-dropzone')).toBeVisible()
  })

  test('dropzone has correct region aria-label', async ({ page }) => {
    await expect(
      page.getByRole('region', {
        name: /file upload dropzone/i,
      }),
    ).toBeVisible()
  })

  test('"Upload Files" button is visible', async ({ page }) => {
    await expect(page.getByTestId('upload-files-btn')).toBeVisible()
  })

  test('file grid is rendered', async ({ page }) => {
    await expect(page.getByTestId('file-grid')).toBeVisible()
  })
})

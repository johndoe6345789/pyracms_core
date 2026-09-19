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

  test(
    'mocked file card is rendered',
    async ({ page }) => {
      await expect(
        page.getByTestId('file-card-f1'),
      ).toBeVisible()
    },
  )

  test(
    'mocked file card shows file name',
    async ({ page }) => {
      await expect(
        page.getByTestId('file-card-f1'),
      ).toContainText('logo.png')
    },
  )

  test(
    'delete-file button is present for mocked file',
    async ({ page }) => {
      await expect(
        page.getByTestId('delete-file-f1'),
      ).toBeVisible()
    },
  )

  test(
    'delete-file button has correct aria-label',
    async ({ page }) => {
      await expect(
        page.getByRole('button', {
          name: /delete file logo\.png/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    'clicking delete-file opens confirm dialog',
    async ({ page }) => {
      await page
        .getByTestId('delete-file-f1')
        .click()
      await expect(
        page.getByTestId('confirm-dialog'),
      ).toBeVisible()
    },
  )
})

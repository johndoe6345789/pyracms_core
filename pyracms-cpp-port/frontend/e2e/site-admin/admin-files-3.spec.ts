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
    'confirm dialog cancel closes it for file delete',
    async ({ page }) => {
      await page
        .getByTestId('delete-file-f1')
        .click()
      await page
        .getByTestId('confirm-cancel-btn')
        .click()
      await expect(
        page.getByTestId('confirm-dialog'),
      ).not.toBeVisible()
    },
  )

  test(
    'admin sidebar is present on files page',
    async ({ page }) => {
      await expect(
        page.getByTestId('admin-sidebar'),
      ).toBeVisible()
    },
  )
})

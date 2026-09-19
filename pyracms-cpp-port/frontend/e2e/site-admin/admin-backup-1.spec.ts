import { test, expect } from '@playwright/test'
import {
  goToAdmin,
  loginAsAdmin,
  mockApiRoutes,
} from '../support/site-admin-helpers-1'

test.describe('Admin Backup', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
    await loginAsAdmin(page)
    await goToAdmin(page, '/backup')
  })

  test(
    'page loads and toolbar is visible',
    async ({ page }) => {
      await expect(
        page.getByTestId('admin-toolbar'),
      ).toBeVisible()
    },
  )

  test(
    'page has "Backup" heading',
    async ({ page }) => {
      await expect(
        page.getByRole('heading', {
          name: /backup/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    'Export section heading is visible',
    async ({ page }) => {
      await expect(
        page.getByRole('heading', {
          name: /^export$/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    '"Export Settings" button is visible',
    async ({ page }) => {
      await expect(
        page.getByRole('button', {
          name: /export settings/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    '"Export Menus" button is visible',
    async ({ page }) => {
      await expect(
        page.getByRole('button', {
          name: /export menus/i,
        }),
      ).toBeVisible()
    },
  )
})

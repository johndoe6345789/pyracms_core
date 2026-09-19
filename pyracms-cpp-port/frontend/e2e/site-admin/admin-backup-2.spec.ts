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
    'clicking "Export Settings" does not throw',
    async ({ page }) => {
      const errors: string[] = []
      page.on('pageerror', (e) =>
        errors.push(e.message),
      )
      await page
        .getByRole('button', {
          name: /export settings/i,
        })
        .click()
      expect(errors).toHaveLength(0)
    },
  )

  test(
    'clicking "Export Menus" does not throw',
    async ({ page }) => {
      const errors: string[] = []
      page.on('pageerror', (e) =>
        errors.push(e.message),
      )
      await page
        .getByRole('button', {
          name: /export menus/i,
        })
        .click()
      expect(errors).toHaveLength(0)
    },
  )

  test(
    'Import / Restore section is visible',
    async ({ page }) => {
      await expect(
        page.getByText(/import \/ restore/i),
      ).toBeVisible()
    },
  )

  test(
    'caution warning alert is rendered',
    async ({ page }) => {
      await expect(
        page.getByText(/caution: restoring data/i),
      ).toBeVisible()
    },
  )

  test(
    '"Choose File" import button is visible',
    async ({ page }) => {
      await expect(
        page.getByRole('button', {
          name: /choose file/i,
        }),
      ).toBeVisible()
    },
  )
})

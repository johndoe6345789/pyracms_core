import { test, expect } from '@playwright/test'
import {
  goToAdmin,
  loginAsAdmin,
  mockApiRoutes,
} from '../support/site-admin-helpers-1'

test.describe('Admin Templates', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
    await loginAsAdmin(page)
    await goToAdmin(page, '/templates')
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
    'page has "Template Editor" heading',
    async ({ page }) => {
      await expect(
        page.getByRole('heading', {
          name: /template editor/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    '"Template Section" select is present',
    async ({ page }) => {
      await expect(
        page.getByLabel('Template Section'),
      ).toBeVisible()
    },
  )

  test(
    '"Template Section" select defaults to "Header"',
    async ({ page }) => {
      await expect(
        page.getByLabel('Template Section'),
      ).toContainText('Header')
    },
  )
})

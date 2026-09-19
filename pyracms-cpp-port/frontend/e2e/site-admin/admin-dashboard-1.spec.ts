import { test, expect } from '@playwright/test'
import {
  goToAdmin,
  loginAsAdmin,
  mockApiRoutes,
} from '../support/site-admin-helpers-1'

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
    await loginAsAdmin(page)
    await goToAdmin(page)
  })

  test(
    'page loads and dashboard container is visible',
    async ({ page }) => {
      await expect(
        page.getByTestId('admin-dashboard'),
      ).toBeVisible()
    },
  )

  test(
    'page has a prominent "Dashboard" heading',
    async ({ page }) => {
      const heading = page.getByRole('heading', {
        name: /dashboard/i,
      })
      await expect(heading.first()).toBeVisible()
    },
  )

  test(
    'admin toolbar renders the slug Admin title',
    async ({ page }) => {
      await expect(
        page.getByTestId('admin-toolbar'),
      ).toContainText('Admin')
    },
  )

  test(
    'admin sidebar is present on desktop',
    async ({ page }) => {
      await expect(
        page.getByTestId('admin-sidebar'),
      ).toBeVisible()
    },
  )

  test(
    'admin navigation has aria-label "Admin navigation"',
    async ({ page }) => {
      await expect(
        page.getByRole('navigation', {
          name: /admin navigation/i,
        }),
      ).toBeVisible()
    },
  )

  test('quick-links grid is rendered', async ({ page }) => {
    await expect(
      page.getByTestId('quick-links-grid'),
    ).toBeVisible()
  })
})

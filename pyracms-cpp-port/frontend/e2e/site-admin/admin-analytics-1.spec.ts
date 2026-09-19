import { test, expect } from '@playwright/test'
import {
  goToAdmin,
  loginAsAdmin,
  mockApiRoutes,
} from '../support/site-admin-helpers-1'

test.describe('Admin Analytics', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
    await loginAsAdmin(page)
    await goToAdmin(page, '/analytics')
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
    'page has "Analytics Dashboard" heading',
    async ({ page }) => {
      await expect(
        page.getByRole('heading', {
          name: /analytics dashboard/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    '"Top Referrers" section is rendered',
    async ({ page }) => {
      await expect(
        page.getByText('Top Referrers'),
      ).toBeVisible()
    },
  )

  test(
    '"Popular Search Queries" section is rendered',
    async ({ page }) => {
      await expect(
        page.getByText('Popular Search Queries'),
      ).toBeVisible()
    },
  )

  test(
    'referrer table shows "Google Search" row',
    async ({ page }) => {
      await expect(
        page.getByText('Google Search'),
      ).toBeVisible()
    },
  )

  test(
    'referrer table shows "Direct" row',
    async ({ page }) => {
      await expect(
        page.getByText('Direct'),
      ).toBeVisible()
    },
  )

  test(
    'referrer table shows "GitHub" row',
    async ({ page }) => {
      await expect(
        page.getByText('GitHub'),
      ).toBeVisible()
    },
  )
})

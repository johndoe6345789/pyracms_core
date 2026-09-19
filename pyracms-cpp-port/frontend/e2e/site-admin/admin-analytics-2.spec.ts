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
    'referrer table has Source column header',
    async ({ page }) => {
      await expect(
        page.getByRole('columnheader', {
          name: /source/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    'referrer table has Visits column header',
    async ({ page }) => {
      await expect(
        page.getByRole('columnheader', {
          name: /visits/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    'search queries table shows "next.js tutorial"',
    async ({ page }) => {
      await expect(
        page.getByText('next.js tutorial'),
      ).toBeVisible()
    },
  )

  test(
    'search queries table has Query column header',
    async ({ page }) => {
      await expect(
        page.getByRole('columnheader', {
          name: /query/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    'admin sidebar is present on analytics page',
    async ({ page }) => {
      await expect(
        page.getByTestId('admin-sidebar'),
      ).toBeVisible()
    },
  )
})

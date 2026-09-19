import { test, expect } from '@playwright/test'
import {
  goToAdmin,
  loginAsAdmin,
  mockApiRoutes,
} from '../support/site-admin-helpers-1'

test.describe('Admin Styles', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
    await loginAsAdmin(page)
    await goToAdmin(page, '/styles')
  })

  test('page loads and toolbar is visible', async ({ page }) => {
    await expect(page.getByTestId('admin-toolbar')).toBeVisible()
  })

  test('page has "Style Editor" heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', {
        name: /style editor/i,
      }),
    ).toBeVisible()
  })

  test('"Colors" section heading is rendered', async ({ page }) => {
    await expect(
      page.getByRole('heading', {
        name: /^colors$/i,
      }),
    ).toBeVisible()
  })

  test('"Typography" section heading is rendered', async ({ page }) => {
    await expect(
      page.getByRole('heading', {
        name: /^typography$/i,
      }),
    ).toBeVisible()
  })

  test('"Layout" section heading is rendered', async ({ page }) => {
    await expect(
      page.getByRole('heading', {
        name: /^layout$/i,
      }),
    ).toBeVisible()
  })

  test('"Font Family" select is present', async ({ page }) => {
    await expect(page.getByLabel('Font Family')).toBeVisible()
  })
})

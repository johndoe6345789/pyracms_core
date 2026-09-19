import { test, expect } from '@playwright/test'
import { SITE_SLUG } from '../support/site-admin-data-1'
import {
  goToAdmin,
  loginAsAdmin,
  mockApiRoutes,
} from '../support/site-admin-helpers-1'

test.describe('Admin sidebar navigation', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
    await loginAsAdmin(page)
    await goToAdmin(page)
  })

  test('clicking Backup nav item navigates to backup page', async ({
    page,
  }) => {
    await page.getByTestId('admin-nav-backup').click()
    await expect(page).toHaveURL(new RegExp(`/site/${SITE_SLUG}/admin/backup`))
    await expect(
      page.getByRole('heading', {
        name: /backup/i,
      }),
    ).toBeVisible()
  })

  test('clicking Templates nav item navigates to templates page', async ({
    page,
  }) => {
    await page.getByTestId('admin-nav-templates').click()
    await expect(page).toHaveURL(
      new RegExp(`/site/${SITE_SLUG}/admin/templates`),
    )
    await expect(
      page.getByRole('heading', {
        name: /template editor/i,
      }),
    ).toBeVisible()
  })

  test('clicking Styles nav item navigates to styles page', async ({
    page,
  }) => {
    await page.getByTestId('admin-nav-styles').click()
    await expect(page).toHaveURL(new RegExp(`/site/${SITE_SLUG}/admin/styles`))
    await expect(
      page.getByRole('heading', {
        name: /style editor/i,
      }),
    ).toBeVisible()
  })
})

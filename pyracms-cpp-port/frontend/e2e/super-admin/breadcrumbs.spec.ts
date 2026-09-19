import { test, expect } from '@playwright/test'
import { ADMIN_USER } from '../support/super-admin-data-1'
import { loginAs } from '../support/super-admin-helpers-1'

test.describe('Breadcrumbs — per page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, ADMIN_USER)
  })

  const PAGES: [string, string, string][] = [
    [
      '/super-admin',
      'Super Admin',
      '',
    ],
    [
      '/super-admin/tenants',
      'Tenants',
      'breadcrumb-link-super-admin',
    ],
    [
      '/super-admin/users',
      'Users',
      'breadcrumb-link-super-admin',
    ],
    [
      '/super-admin/settings',
      'Settings',
      'breadcrumb-link-super-admin',
    ],
  ]

  for (const [path, currentLabel, linkTestId] of PAGES) {
    test(
      `${path} breadcrumb current = "${currentLabel}"`,
      async ({ page }) => {
        await page.goto(path)
        await page
          .getByTestId('super-admin-breadcrumbs')
          .waitFor({ state: 'visible', timeout: 10_000 })

        await expect(
          page.getByTestId('breadcrumb-current'),
        ).toHaveText(currentLabel)

        if (linkTestId) {
          await expect(
            page.getByTestId(linkTestId),
          ).toBeVisible()
        }
      },
    )
  }
})

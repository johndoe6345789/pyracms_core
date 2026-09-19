import { test, expect } from '@playwright/test'
import {
  goToAdmin,
  loginAsAdmin,
  mockApiRoutes,
} from '../support/site-admin-helpers-1'

test.describe('Admin ACL', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
    await loginAsAdmin(page)
    await goToAdmin(page, '/acl')
    await page
      .getByTestId('admin-acl-page')
      .waitFor({ state: 'visible', timeout: 10_000 })
  })

  test(
    'mocked rule shows permission "manage_users"',
    async ({ page }) => {
      await expect(
        page.getByTestId('acl-row-1'),
      ).toContainText('manage_users')
    },
  )

  test(
    'delete-acl button is present for mocked rule',
    async ({ page }) => {
      await expect(
        page.getByTestId('delete-acl-1'),
      ).toBeVisible()
    },
  )

  test(
    'delete-acl button has correct aria-label',
    async ({ page }) => {
      await expect(
        page.getByRole('button', {
          name: /delete rule for admin/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    'ACL action select can be changed to "Deny"',
    async ({ page }) => {
      // The MUI Select renders a combobox
      const select = page.getByTestId(
        'acl-action-select',
      )
      await select.click()
      await page
        .getByRole('option', { name: 'Deny' })
        .click()
      await expect(select).toContainText('Deny')
    },
  )

  test(
    'admin sidebar is present on ACL page',
    async ({ page }) => {
      await expect(
        page.getByTestId('admin-sidebar'),
      ).toBeVisible()
    },
  )
})

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
    '"Add Rule" button is visible',
    async ({ page }) => {
      await expect(
        page.getByTestId('add-acl-rule-btn'),
      ).toBeVisible()
    },
  )

  test(
    '"Add Rule" button disabled when fields are empty',
    async ({ page }) => {
      await expect(
        page.getByTestId('add-acl-rule-btn'),
      ).toBeDisabled()
    },
  )

  test(
    '"Add Rule" button enables when fields are filled',
    async ({ page }) => {
      await page
        .getByTestId('acl-principal-input')
        .fill('editor')
      await page
        .getByTestId('acl-permission-input')
        .fill('edit_articles')
      await expect(
        page.getByTestId('add-acl-rule-btn'),
      ).toBeEnabled()
    },
  )

  test(
    'ACL rule table is rendered',
    async ({ page }) => {
      await expect(
        page.getByTestId('acl-rule-table'),
      ).toBeVisible()
    },
  )

  test(
    'mocked ACL rule row is visible',
    async ({ page }) => {
      await expect(
        page.getByTestId('acl-row-1'),
      ).toBeVisible()
    },
  )

  test(
    'mocked rule shows principal "admin"',
    async ({ page }) => {
      await expect(
        page.getByTestId('acl-row-1'),
      ).toContainText('admin')
    },
  )
})

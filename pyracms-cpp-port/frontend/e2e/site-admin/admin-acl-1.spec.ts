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
    'page loads — admin-acl-page container visible',
    async ({ page }) => {
      await expect(
        page.getByTestId('admin-acl-page'),
      ).toBeVisible()
    },
  )

  test(
    'page has "ACL Editor" heading',
    async ({ page }) => {
      await expect(
        page.getByRole('heading', {
          name: /acl editor/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    'add-acl-rule form is rendered',
    async ({ page }) => {
      await expect(
        page.getByTestId('add-acl-rule-form'),
      ).toBeVisible()
    },
  )

  test(
    'ACL action select is present',
    async ({ page }) => {
      await expect(
        page.getByTestId('acl-action-select'),
      ).toBeVisible()
    },
  )

  test(
    'ACL principal input is present',
    async ({ page }) => {
      await expect(
        page.getByTestId('acl-principal-input'),
      ).toBeVisible()
    },
  )

  test(
    'ACL permission input is present',
    async ({ page }) => {
      await expect(
        page.getByTestId('acl-permission-input'),
      ).toBeVisible()
    },
  )
})

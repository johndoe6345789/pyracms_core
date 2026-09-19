import { test, expect } from '@playwright/test'
import {
  goToAdmin,
  loginAsAdmin,
  mockApiRoutes,
} from '../support/site-admin-helpers-1'

test.describe('Admin Menus', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
    await loginAsAdmin(page)
    await goToAdmin(page, '/menus')
    await page
      .getByTestId('admin-menus-page')
      .waitFor({ state: 'visible', timeout: 10_000 })
  })

  test(
    'page loads — admin-menus-page container visible',
    async ({ page }) => {
      await expect(
        page.getByTestId('admin-menus-page'),
      ).toBeVisible()
    },
  )

  test(
    'page has "Menu Editor" heading',
    async ({ page }) => {
      await expect(
        page.getByRole('heading', {
          name: /menu editor/i,
        }),
      ).toBeVisible()
    },
  )

  test(
    'menu group select is visible',
    async ({ page }) => {
      await expect(
        page.getByLabel('Menu Group'),
      ).toBeVisible()
    },
  )

  test(
    'menu group select shows mocked group',
    async ({ page }) => {
      await expect(
        page.getByLabel('Menu Group'),
      ).toContainText('main')
    },
  )

  test(
    'menu name input is visible',
    async ({ page }) => {
      await expect(
        page.getByTestId('menu-name-input'),
      ).toBeVisible()
    },
  )

  test(
    'menu route input is visible',
    async ({ page }) => {
      await expect(
        page.getByTestId('menu-route-input'),
      ).toBeVisible()
    },
  )
})

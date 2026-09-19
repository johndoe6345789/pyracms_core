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

  test('menu position input is visible', async ({ page }) => {
    await expect(page.getByTestId('menu-position-input')).toBeVisible()
  })

  test('menu permissions select is visible', async ({ page }) => {
    await expect(page.getByTestId('menu-permissions-select')).toBeVisible()
  })

  test('menu permissions select has public/authenticated/admin options', async ({
    page,
  }) => {
    const select = page.getByTestId('menu-permissions-select')
    await select.click()
    await expect(page.getByRole('option', { name: 'public' })).toBeVisible()
    await expect(
      page.getByRole('option', {
        name: 'authenticated',
      }),
    ).toBeVisible()
    await expect(page.getByRole('option', { name: 'admin' })).toBeVisible()
    await page.keyboard.press('Escape')
  })

  test('"Add Item" button is visible', async ({ page }) => {
    await expect(page.getByTestId('add-menu-item-btn')).toBeVisible()
  })

  test('"Add Item" button is disabled when name/route empty', async ({
    page,
  }) => {
    await expect(page.getByTestId('add-menu-item-btn')).toBeDisabled()
  })
})

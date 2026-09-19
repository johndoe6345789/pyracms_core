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

  test('"Add Item" button enables when name and route filled', async ({
    page,
  }) => {
    await page.getByTestId('menu-name-input').fill('Blog')
    await page.getByTestId('menu-route-input').fill('/blog')
    await expect(page.getByTestId('add-menu-item-btn')).toBeEnabled()
  })

  test('"New Menu Group" button is visible', async ({ page }) => {
    await expect(
      page.getByRole('button', {
        name: /new menu group/i,
      }),
    ).toBeVisible()
  })

  test('clicking "New Menu Group" opens create-group dialog', async ({
    page,
  }) => {
    await page
      .getByRole('button', {
        name: /new menu group/i,
      })
      .click()
    await expect(page.getByTestId('create-group-dialog')).toBeVisible()
  })

  test('create-group dialog has group-name-input', async ({ page }) => {
    await page
      .getByRole('button', {
        name: /new menu group/i,
      })
      .click()
    await expect(page.getByTestId('group-name-input')).toBeVisible()
  })
})

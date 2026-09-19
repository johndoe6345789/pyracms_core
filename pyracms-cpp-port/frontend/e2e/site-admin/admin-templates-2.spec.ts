import { test, expect } from '@playwright/test'
import {
  goToAdmin,
  loginAsAdmin,
  mockApiRoutes,
} from '../support/site-admin-helpers-1'

test.describe('Admin Templates', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
    await loginAsAdmin(page)
    await goToAdmin(page, '/templates')
  })

  test('"Template Section" select has Header/Footer/Sidebar/Layout', async ({
    page,
  }) => {
    await page.getByLabel('Template Section').click()
    await expect(
      page.getByRole('option', {
        name: 'Header',
      }),
    ).toBeVisible()
    await expect(
      page.getByRole('option', {
        name: 'Footer',
      }),
    ).toBeVisible()
    await expect(
      page.getByRole('option', {
        name: 'Sidebar',
      }),
    ).toBeVisible()
    await expect(
      page.getByRole('option', {
        name: 'Main Layout',
      }),
    ).toBeVisible()
    await page.keyboard.press('Escape')
  })

  test('selecting "Footer" section changes preview', async ({ page }) => {
    await page.getByLabel('Template Section').click()
    await page.getByRole('option', { name: 'Footer' }).click()
    await expect(page.getByText(/live preview - footer/i)).toBeVisible()
  })

  test('Preview toggle button is present', async ({ page }) => {
    await expect(
      page.getByRole('button', {
        name: /preview/i,
      }),
    ).toBeVisible()
  })
})

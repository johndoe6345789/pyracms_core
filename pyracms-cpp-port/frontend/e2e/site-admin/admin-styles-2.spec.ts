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

  test('"Font Family" select has multiple options', async ({ page }) => {
    await page.getByLabel('Font Family').click()
    await expect(
      page.getByRole('option', {
        name: /Roboto/i,
      }),
    ).toBeVisible()
    await expect(
      page.getByRole('option', {
        name: /Inter/i,
      }),
    ).toBeVisible()
    await page.keyboard.press('Escape')
  })

  test('"Primary Color" label is present', async ({ page }) => {
    await expect(page.getByText('Primary Color')).toBeVisible()
  })

  test('"Secondary Color" label is present', async ({ page }) => {
    await expect(page.getByText('Secondary Color')).toBeVisible()
  })

  test('"Background Color" label is present', async ({ page }) => {
    await expect(page.getByText('Background Color')).toBeVisible()
  })

  test('"Text Color" label is present', async ({ page }) => {
    await expect(page.getByText('Text Color')).toBeVisible()
  })
})

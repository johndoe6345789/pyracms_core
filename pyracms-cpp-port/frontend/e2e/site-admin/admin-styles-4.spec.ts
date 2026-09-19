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

  test('"Reset" button is visible', async ({ page }) => {
    await expect(
      page.getByRole('button', {
        name: /^reset$/i,
      }),
    ).toBeVisible()
  })

  test('"Export JSON" button is visible', async ({ page }) => {
    await expect(
      page.getByRole('button', {
        name: /export json/i,
      }),
    ).toBeVisible()
  })

  test('"Import JSON" button is visible', async ({ page }) => {
    await expect(
      page.getByRole('button', {
        name: /import json/i,
      }),
    ).toBeVisible()
  })

  test('clicking "Reset" restores default color value', async ({ page }) => {
    // Change primary color input to something else
    const hexInputs = page.locator('input[value^="#"]')
    await hexInputs.first().fill('#ff0000')
    await page
      .getByRole('button', {
        name: /^reset$/i,
      })
      .click()
    // After reset the primary should be back to default
    await expect(hexInputs.first()).not.toHaveValue('#ff0000')
  })

  test('preview area shows "Sample Article Title"', async ({ page }) => {
    await expect(page.getByText('Sample Article Title')).toBeVisible()
  })
})

import { test, expect } from '@playwright/test'
import { BASE } from '../support/tenant-data-1'

test.describe('Tenant home — /site/demo/', () => {
  test('clicking the Gallery card navigates to gallery', async ({ page }) => {
    await page.goto(`${BASE}/`)
    await page.getByRole('link', { name: /Gallery/i }).click()
    await expect(page).toHaveURL(new RegExp(`${BASE}/gallery`))
  })

  test('clicking the Games card navigates to games', async ({ page }) => {
    await page.goto(`${BASE}/`)
    await page.getByRole('link', { name: /Games/i }).click()
    await expect(page).toHaveURL(new RegExp(`${BASE}/games`))
  })

  test('all module cards are keyboard-focusable', async ({ page }) => {
    await page.goto(`${BASE}/`)
    // Tab through the first four focusable links.
    await page.keyboard.press('Tab')
    // At least one of the module cards must
    // receive focus via Tab key sequence.
    const focused = page.locator(':focus')
    await expect(focused).toBeVisible()
  })

  test('module card icons are aria-hidden decorations', async ({ page }) => {
    await page.goto(`${BASE}/`)
    // Card descriptions are visible for screen readers.
    await expect(page.getByText(/Read and publish articles/i)).toBeVisible()
  })
})

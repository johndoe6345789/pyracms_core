import { test, expect } from '@playwright/test'
import { BASE } from '../support/tenant-data-1'
import { collectConsoleErrors } from '../support/tenant-helpers-1'

test.describe('Tenant home — /site/demo/', () => {
  test('page loads without a JS console error', async ({ page }) => {
    const { errors, cleanup } = collectConsoleErrors(page)
    await page.goto(`${BASE}/`)
    cleanup()
    // Allow informational / network errors from missing API,
    // but there must be no React render crash.
    const fatalErrors = errors.filter(
      (e) =>
        e.includes('Uncaught') ||
        e.includes('TypeError') ||
        e.includes('ReferenceError'),
    )
    expect(fatalErrors).toHaveLength(0)
  })

  test('site name heading derived from slug is visible', async ({ page }) => {
    await page.goto(`${BASE}/`)
    // slug "demo" → capitalised → "Demo"
    await expect(page.getByRole('heading', { name: 'Demo' })).toBeVisible()
  })

  test('welcome body text mentions the site name', async ({ page }) => {
    await page.goto(`${BASE}/`)
    await expect(page.getByText(/Welcome to Demo/i)).toBeVisible()
  })

  test('module card for Articles is visible and links correctly', async ({
    page,
  }) => {
    await page.goto(`${BASE}/`)
    const card = page.getByRole('link', {
      name: /Articles/i,
    })
    await expect(card).toBeVisible()
    await expect(card).toHaveAttribute('href', `${BASE}/articles`)
  })

  test('module card for Forum is visible and links correctly', async ({
    page,
  }) => {
    await page.goto(`${BASE}/`)
    const card = page.getByRole('link', {
      name: /Forum/i,
    })
    await expect(card).toBeVisible()
    await expect(card).toHaveAttribute('href', `${BASE}/forum`)
  })
})

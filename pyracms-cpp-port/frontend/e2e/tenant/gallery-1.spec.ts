import { test, expect } from '@playwright/test'
import { BASE, MOCK_TENANT } from '../support/tenant-data-1'

test.describe('Gallery — /site/demo/gallery', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/tenants**', (route) =>
      route.fulfill({ json: MOCK_TENANT }),
    )
    await page.route('**/api/gallery/albums**', (route) =>
      route.fulfill({ json: [] }),
    )
  })

  test('page loads and shows "Gallery" heading', async ({ page }) => {
    await page.goto(`${BASE}/gallery`)
    await expect(page.getByRole('heading', { name: 'Gallery' })).toBeVisible()
  })

  test('gallery page container is rendered', async ({ page }) => {
    await page.goto(`${BASE}/gallery`)
    await expect(page.getByTestId('gallery-page')).toBeVisible()
  })

  test('"Create Album" button is visible', async ({ page }) => {
    await page.goto(`${BASE}/gallery`)
    await expect(page.getByTestId('create-album-btn')).toBeVisible()
  })

  test('"Create Album" button has accessible aria-label', async ({ page }) => {
    await page.goto(`${BASE}/gallery`)
    await expect(page.getByLabel('Create album')).toBeVisible()
  })

  test('subtitle text about photo albums is visible', async ({ page }) => {
    await page.goto(`${BASE}/gallery`)
    await expect(page.getByText(/Browse photo albums/i)).toBeVisible()
  })

  test('album grid container is rendered', async ({ page }) => {
    await page.goto(`${BASE}/gallery`)
    await expect(page.getByTestId('album-grid')).toBeVisible()
  })
})

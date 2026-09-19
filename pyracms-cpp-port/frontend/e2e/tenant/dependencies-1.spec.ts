import { test, expect } from '@playwright/test'
import { BASE } from '../support/tenant-data-1'

test.describe('Dependencies — /site/demo/dependencies', () => {
  test('page loads and shows "Dependencies" heading', async ({ page }) => {
    await page.goto(`${BASE}/dependencies`)
    await expect(
      page.getByRole('heading', {
        name: 'Dependencies',
      }),
    ).toBeVisible()
  })

  test('subtitle about shared libraries is visible', async ({ page }) => {
    await page.goto(`${BASE}/dependencies`)
    await expect(
      page.getByText(/Browse shared libraries and dependencies/i),
    ).toBeVisible()
  })

  test('search input is present on dependencies page', async ({ page }) => {
    await page.goto(`${BASE}/dependencies`)
    await expect(page.getByPlaceholder('Search dependencies...')).toBeVisible()
  })

  test('typing in search updates value', async ({ page }) => {
    await page.goto(`${BASE}/dependencies`)
    const searchInput = page.getByPlaceholder('Search dependencies...')
    await searchInput.fill('opengl')
    await expect(searchInput).toHaveValue('opengl')
  })

  test('"Filter by Tag" dropdown is present', async ({ page }) => {
    await page.goto(`${BASE}/dependencies`)
    await expect(page.getByLabel('Filter by Tag')).toBeVisible()
  })

  test('"Sort By" dropdown is present', async ({ page }) => {
    await page.goto(`${BASE}/dependencies`)
    await expect(page.getByLabel('Sort By')).toBeVisible()
  })
})

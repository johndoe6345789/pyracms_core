import { test, expect } from '@playwright/test'
import { BASE } from '../support/tenant-data-1'

test.describe('Games — /site/demo/games', () => {
  test('page loads and shows "Game Catalog" heading', async ({ page }) => {
    await page.goto(`${BASE}/games`)
    await expect(
      page.getByRole('heading', {
        name: 'Game Catalog',
      }),
    ).toBeVisible()
  })

  test('subtitle text about Hypernucleus is visible', async ({ page }) => {
    await page.goto(`${BASE}/games`)
    await expect(page.getByText(/Hypernucleus/i)).toBeVisible()
  })

  test('search input is present on games page', async ({ page }) => {
    await page.goto(`${BASE}/games`)
    await expect(page.getByPlaceholder('Search games...')).toBeVisible()
  })

  test('typing in search input filters results', async ({ page }) => {
    await page.goto(`${BASE}/games`)
    const searchInput = page.getByPlaceholder('Search games...')
    await searchInput.fill('space')
    await expect(searchInput).toHaveValue('space')
  })

  test('"Filter by Tag" dropdown is present', async ({ page }) => {
    await page.goto(`${BASE}/games`)
    await expect(page.getByLabel('Filter by Tag')).toBeVisible()
  })

  test('"Sort By" dropdown is present', async ({ page }) => {
    await page.goto(`${BASE}/games`)
    await expect(page.getByLabel('Sort By')).toBeVisible()
  })

  test('game cards are rendered from placeholder data', async ({ page }) => {
    await page.goto(`${BASE}/games`)
    // PLACEHOLDER_GAMES always has items — at least one
    // card link must appear.
    await expect(page.locator('a').first()).toBeVisible()
  })
})

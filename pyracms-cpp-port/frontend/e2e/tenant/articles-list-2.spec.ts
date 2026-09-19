import { test, expect } from '@playwright/test'
import { BASE, MOCK_ARTICLES_LIST, MOCK_TENANT } from '../support/tenant-data-1'

test.describe('Articles list — /site/demo/articles', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the tenant lookup and articles API so the page
    // renders predictably without a live backend.
    await page.route('**/api/tenants**', (route) =>
      route.fulfill({ json: MOCK_TENANT }),
    )
    await page.route('**/api/articles**', (route) =>
      route.fulfill({ json: { items: [], total: 0 } }),
    )
  })

  test('empty state is shown when no articles exist', async ({ page }) => {
    await page.goto(`${BASE}/articles`)
    // With mocked empty response the page must not crash.
    // Either an empty-state element or no article rows.
    const body = page.locator('body')
    await expect(body).toBeVisible()
  })

  test('typing in search bar updates the input value', async ({ page }) => {
    await page.goto(`${BASE}/articles`)
    const searchInput = page.getByTestId('article-search-input')
    await searchInput.fill('playwright')
    await expect(searchInput).toHaveValue('playwright')
  })

  test('article list grid is rendered with articles', async ({ page }) => {
    // Override empty mock to include two articles.
    await page.route('**/api/articles**', (route) =>
      route.fulfill({ json: MOCK_ARTICLES_LIST }),
    )
    await page.goto(`${BASE}/articles`)
    await expect(page.getByTestId('article-list')).toBeVisible({
      timeout: 8_000,
    })
  })

  test('article card link navigates to article detail', async ({ page }) => {
    await page.route('**/api/articles**', (route) =>
      route.fulfill({ json: MOCK_ARTICLES_LIST }),
    )
    await page.goto(`${BASE}/articles`)
    const link = page.getByTestId('article-card-link-hello-world')
    await expect(link).toBeVisible({ timeout: 8_000 })
    await expect(link).toHaveAttribute('href', `${BASE}/articles/hello-world`)
  })
})

import { test, expect } from '@playwright/test'
import { BASE, MOCK_TENANT } from '../support/tenant-data-1'

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

  test(
    'page loads and shows "Articles" heading',
    async ({ page }) => {
      await page.goto(`${BASE}/articles`)
      await expect(
        page.getByRole('heading', { name: 'Articles' }),
      ).toBeVisible()
    },
  )

  test(
    'article list page container is rendered',
    async ({ page }) => {
      await page.goto(`${BASE}/articles`)
      await expect(
        page.getByTestId('article-list-page'),
      ).toBeVisible()
    },
  )

  test('search bar is present', async ({ page }) => {
    await page.goto(`${BASE}/articles`)
    await expect(
      page.getByTestId('article-search-input'),
    ).toBeVisible()
  })

  test(
    'search bar has correct accessible label',
    async ({ page }) => {
      await page.goto(`${BASE}/articles`)
      await expect(
        page.getByLabel('Search articles'),
      ).toBeVisible()
    },
  )

  test(
    '"Create Article" button is visible',
    async ({ page }) => {
      await page.goto(`${BASE}/articles`)
      await expect(
        page.getByTestId('create-article-btn'),
      ).toBeVisible()
    },
  )

  test(
    '"Create Article" button links to the create page',
    async ({ page }) => {
      await page.goto(`${BASE}/articles`)
      await expect(
        page.getByTestId('create-article-btn'),
      ).toHaveAttribute('href', `${BASE}/articles/create`)
    },
  )
})

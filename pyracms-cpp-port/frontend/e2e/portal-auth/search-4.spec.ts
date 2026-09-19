import { test, expect } from '@playwright/test'

test.describe('Search — /search', () => {
  test(
    'mocked API: clicking a search result navigates '
    + 'to its URL',
    async ({ page }) => {
      const targetUrl = '/site/demo/articles/hello-world'

      await page.route('**/api/search*', (route) => {
        if (route.request().url().includes('autocomplete')) {
          return route.continue()
        }
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            items: [
              {
                type: 'article',
                id: 1,
                title: 'Hello World Article',
                snippet: 'A short snippet',
                url: targetUrl,
                rank: 1.0,
                createdAt: '2024-01-01T00:00:00Z',
              },
            ],
            totalCount: 1,
            facets: { article: 1 },
          }),
        })
      })

      await page.goto('/search?q=hello')
      await page.waitForLoadState('networkidle')

      const result = page.getByTestId('search-result-0')
      await expect(result).toBeVisible({ timeout: 8_000 })
      await expect(result).toHaveAttribute('href', targetUrl)
    },
  )

  test(
    'mocked API: empty state is shown when API '
    + 'returns zero items',
    async ({ page }) => {
      await page.route('**/api/search*', (route) => {
        if (route.request().url().includes('autocomplete')) {
          return route.continue()
        }
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            items: [],
            totalCount: 0,
            facets: {},
          }),
        })
      })

      await page.goto('/search?q=zzz')
      await page.waitForLoadState('networkidle')

      await expect(
        page.getByTestId('search-empty'),
      ).toBeVisible({ timeout: 8_000 })
    },
  )
})

import { test, expect } from '@playwright/test'

test.describe('Search — /search', () => {
  // ---- NEW: search results ARIA ----

  test(
    'mocked API: search-results list has ' + 'aria-label="Search results"',
    async ({ page }) => {
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
                title: 'Test',
                snippet: 'snip',
                url: '/site/demo/articles/test',
                rank: 1,
                createdAt: '2024-01-01T00:00:00Z',
              },
            ],
            totalCount: 1,
            facets: { article: 1 },
          }),
        })
      })

      await page.goto('/search?q=test')
      await page.waitForLoadState('networkidle')

      const list = page.getByTestId('search-results')
      await expect(list).toBeVisible({ timeout: 8_000 })
      await expect(list).toHaveAttribute('aria-label', /search results/i)
    },
  )
})

import { test, expect } from '@playwright/test'

test.describe('Search — /search', () => {
  // ---- NEW: pagination ----

  test('mocked API: pagination appears when total > 10', async ({ page }) => {
    await page.route('**/api/search*', (route) => {
      if (route.request().url().includes('autocomplete')) {
        return route.continue()
      }
      const items = Array.from({ length: 10 }, (_, i) => ({
        type: 'article',
        id: i + 1,
        title: `Article ${i + 1}`,
        snippet: 'snippet',
        url: `/site/demo/articles/${i + 1}`,
        rank: 1.0,
        createdAt: '2024-01-01T00:00:00Z',
      }))
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items,
          totalCount: 25,
          facets: { article: 25 },
        }),
      })
    })

    await page.goto('/search?q=article')
    await page.waitForLoadState('networkidle')

    await expect(page.getByTestId('search-pagination')).toBeVisible({
      timeout: 8_000,
    })
  })
})

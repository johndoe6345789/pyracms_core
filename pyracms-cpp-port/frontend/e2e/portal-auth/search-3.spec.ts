import { test, expect } from '@playwright/test'

test.describe('Search — /search', () => {
  // ---- NEW: mocked API — results list interaction ----

  test(
    'mocked API: search results are rendered as '
    + 'clickable links',
    async ({ page }) => {
      await page.route('**/api/search*', (route) => {
        // Only mock GET requests without "autocomplete"
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
                url: '/site/demo/articles/hello-world',
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

      // The list item is a link (<a>)
      const href = await result.getAttribute('href')
      expect(href).toBeTruthy()
    },
  )
})

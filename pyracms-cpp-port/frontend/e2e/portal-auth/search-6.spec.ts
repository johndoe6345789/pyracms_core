import { test, expect } from '@playwright/test'

test.describe('Search — /search', () => {
  test(
    'mocked API: FacetSidebar "Articles" filter is ' +
      'visible when articles facet has count > 0',
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
                title: 'Test Article',
                snippet: 'snippet',
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

      // "Articles" list-item button in the FacetSidebar
      const articlesBtn = page.getByRole('button', {
        name: /Articles/i,
      })
      await expect(articlesBtn.first()).toBeVisible({
        timeout: 8_000,
      })
      await articlesBtn.first().click()
      await expect(page).toHaveURL(/\/search/)
    },
  )
})

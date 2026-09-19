import { test, expect } from '@playwright/test'

test.describe('Search — /search', () => {
  test(
    'mocked API: clicking page 2 in pagination triggers '
    + 'a new search',
    async ({ page }) => {
      const requests: string[] = []

      await page.route('**/api/search*', (route) => {
        if (route.request().url().includes('autocomplete')) {
          return route.continue()
        }
        requests.push(route.request().url())
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

      // Click page 2 button in the MUI Pagination
      const page2btn = page.getByRole('button', {
        name: /page 2/i,
      })
      await expect(page2btn).toBeVisible({
        timeout: 8_000,
      })
      await page2btn.click()

      // A second search request should have been fired
      await page.waitForLoadState('networkidle')
      expect(requests.length).toBeGreaterThan(1)
    },
  )
})

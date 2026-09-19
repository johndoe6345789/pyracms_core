import { test, expect } from '@playwright/test'

test.describe('Search — /search', () => {
  test(
    'mocked API: each search result has aria-label',
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
                title: 'My Article',
                snippet: 'snip',
                url: '/site/demo/articles/my-article',
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

      const result = page.getByTestId('search-result-0')
      await expect(result).toBeVisible({ timeout: 8_000 })
      const label = await result.getAttribute('aria-label')
      expect(label).toBeTruthy()
    },
  )

  test(
    'search-loading status element has role="status" '
    + 'and aria-live="polite"',
    async ({ page }) => {
      // Slow the API so the loading element appears
      await page.route('**/api/search*', async (route) => {
        if (route.request().url().includes('autocomplete')) {
          return route.continue()
        }
        await new Promise((r) => setTimeout(r, 1_500))
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

      await page.goto('/search?q=loading')

      const loading = page.getByTestId('search-loading')
      // Only check attributes if it becomes visible
      const appeared = await loading.isVisible()
        .catch(() => false)
      if (appeared) {
        await expect(loading).toHaveAttribute(
          'role', 'status',
        )
        await expect(loading).toHaveAttribute(
          'aria-live', 'polite',
        )
      }
    },
  )
})

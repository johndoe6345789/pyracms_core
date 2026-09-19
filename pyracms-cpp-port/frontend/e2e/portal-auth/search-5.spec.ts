import { test, expect } from '@playwright/test'

test.describe('Search — /search', () => {
  // ---- NEW: search-page testid and ARIA ----

  test('search-page has data-testid="search-page"', async ({ page }) => {
    await page.goto('/search')

    await expect(page.getByTestId('search-page')).toBeVisible()
  })

  test('search-page has role="main" and aria-label', async ({ page }) => {
    await page.goto('/search')

    const root = page.getByTestId('search-page')
    await expect(root).toHaveAttribute('role', 'main')
    const label = await root.getAttribute('aria-label')
    expect(label).toBeTruthy()
  })

  // ---- NEW: FacetSidebar filter chip interactions ----

  test(
    'mocked API: FacetSidebar "All" button is visible ' + 'and clickable',
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
            totalCount: 5,
            facets: { article: 3, forum_post: 2 },
          }),
        })
      })

      await page.goto('/search?q=test')
      await page.waitForLoadState('networkidle')

      const allBtn = page.getByRole('button', {
        name: /All/i,
      })
      await expect(allBtn.first()).toBeVisible({
        timeout: 8_000,
      })
      await allBtn.first().click()
      // After clicking All, page should remain on /search
      await expect(page).toHaveURL(/\/search/)
    },
  )
})

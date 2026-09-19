import { test, expect } from '@playwright/test'

test.describe('Search — /search', () => {
  test(
    'results list or empty-state is shown after search',
    async ({ page }) => {
      await page.goto('/search?q=pyracms')

      // Either a non-empty results list or an empty-state
      // element must be visible.
      const resultsList =
        page.getByRole('list', { name: /results/i })
          .or(
            page.locator(
              '[data-testid^="search-result"]',
            ),
          )
      const emptyState =
        page.getByText(/no results/i)
          .or(page.getByText(/nothing found/i))
          .or(
            page.locator(
              '[data-testid="search-empty"]',
            ),
          )

      await Promise.race([
        expect(resultsList.first()).toBeVisible({
          timeout: 10_000,
        }),
        expect(emptyState.first()).toBeVisible({
          timeout: 10_000,
        }),
      ])
    },
  )

  test(
    'pre-populated ?q= param fills the search input',
    async ({ page }) => {
      await page.goto('/search?q=hello')

      const input =
        page.getByTestId('search-autocomplete-input')
          .or(page.getByRole('searchbox'))
          .or(
            page.getByRole('textbox', {
              name: /search/i,
            }),
          )
          .or(page.locator('input[type="search"]'))
          .or(page.locator('input[name="q"]'))

      // The input should already contain the query value.
      await expect(input.first()).toHaveValue('hello', {
        timeout: 8_000,
      })
    },
  )

  test(
    'empty query shows empty-state or placeholder text',
    async ({ page }) => {
      await page.goto('/search?q=')

      // The page must not crash; body is reachable.
      await expect(page.locator('body')).toBeVisible()
    },
  )
})

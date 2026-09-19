import { test, expect } from '@playwright/test'

test.describe('Search — /search', () => {
  test('search page loads without crashing', async ({ page }) => {
    await page.goto('/search')

    // Confirm we are on the right page and it did not 404.
    await expect(page).toHaveURL(/\/search/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('search input is visible', async ({ page }) => {
    await page.goto('/search')

    const input = page
      .getByTestId('search-autocomplete-input')
      .or(page.getByRole('searchbox'))
      .or(page.getByRole('textbox', { name: /search/i }))
      .or(page.locator('input[type="search"]'))
      .or(page.locator('input[name="q"]'))
    await expect(input.first()).toBeVisible({
      timeout: 8_000,
    })
  })

  test('typing a query updates the URL "q" parameter', async ({ page }) => {
    await page.goto('/search')

    const input = page
      .getByTestId('search-autocomplete-input')
      .or(page.getByRole('searchbox'))
      .or(
        page.getByRole('textbox', {
          name: /search/i,
        }),
      )
      .or(page.locator('input[type="search"]'))
      .or(page.locator('input[name="q"]'))

    await input.first().fill('pyracms')
    await input.first().press('Enter')

    await expect(page).toHaveURL(/[?&]q=pyracms/)
  })
})

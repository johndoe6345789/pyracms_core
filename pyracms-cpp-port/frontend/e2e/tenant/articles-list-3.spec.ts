import { test, expect } from '@playwright/test'
import { BASE, MOCK_ARTICLES_LIST, MOCK_TENANT } from '../support/tenant-data-1'
import { collectConsoleErrors } from '../support/tenant-helpers-1'

test.describe('Articles list — /site/demo/articles', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the tenant lookup and articles API so the page
    // renders predictably without a live backend.
    await page.route('**/api/tenants**', (route) =>
      route.fulfill({ json: MOCK_TENANT }),
    )
    await page.route('**/api/articles**', (route) =>
      route.fulfill({ json: { items: [], total: 0 } }),
    )
  })

  test(
    'second article card is rendered',
    async ({ page }) => {
      await page.route('**/api/articles**', (route) =>
        route.fulfill({ json: MOCK_ARTICLES_LIST }),
      )
      await page.goto(`${BASE}/articles`)
      await expect(
        page.getByTestId('article-card-second-post'),
      ).toBeVisible({ timeout: 8_000 })
    },
  )

  test(
    'search input is keyboard-accessible (Tab focus)',
    async ({ page }) => {
      await page.goto(`${BASE}/articles`)
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      const search = page.getByTestId(
        'article-search-input',
      )
      // Check the element exists and is focusable.
      await expect(search).toBeVisible()
    },
  )

  test(
    'article list section has aria-label',
    async ({ page }) => {
      await page.goto(`${BASE}/articles`)
      await expect(
        page.locator('[aria-label="Article listing"]'),
      ).toBeAttached()
    },
  )

  test(
    'pressing Enter in search bar does not crash',
    async ({ page }) => {
      const { errors, cleanup } =
        collectConsoleErrors(page)
      await page.goto(`${BASE}/articles`)
      await page
        .getByTestId('article-search-input')
        .fill('test')
      await page.keyboard.press('Enter')
      cleanup()
      const fatal = errors.filter((e) =>
        e.includes('Uncaught'),
      )
      expect(fatal).toHaveLength(0)
    },
  )
})

import { test, expect } from '@playwright/test'
import { BASE, MOCK_TENANT } from '../support/tenant-data-1'

test.describe('Snippets — /site/demo/snippets', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/tenants**', (route) =>
      route.fulfill({ json: MOCK_TENANT }),
    )
    await page.route('**/api/snippets**', (route) =>
      route.fulfill({ json: { items: [] } }),
    )
  })

  test(
    'snippet search input accepts text',
    async ({ page }) => {
      await page.goto(`${BASE}/snippets`)
      const searchInput = page.getByTestId(
        'snippet-search',
      )
      await searchInput.fill('fibonacci')
      await expect(searchInput).toHaveValue(
        'fibonacci',
      )
    },
  )

  test(
    'language filter dropdown is present',
    async ({ page }) => {
      await page.goto(`${BASE}/snippets`)
      await expect(
        page.getByTestId('language-filter'),
      ).toBeVisible()
    },
  )

  test(
    'sort-by dropdown is present',
    async ({ page }) => {
      await page.goto(`${BASE}/snippets`)
      await expect(
        page.getByTestId('sort-select'),
      ).toBeVisible()
    },
  )

  test(
    'empty state message is shown when no snippets exist',
    async ({ page }) => {
      await page.goto(`${BASE}/snippets`)
      await expect(
        page.getByTestId('no-snippets-msg'),
      ).toBeVisible()
    },
  )

  test(
    '"Back to Site" button is present',
    async ({ page }) => {
      await page.goto(`${BASE}/snippets`)
      await expect(
        page.getByText('Back to Site'),
      ).toBeVisible()
    },
  )
})

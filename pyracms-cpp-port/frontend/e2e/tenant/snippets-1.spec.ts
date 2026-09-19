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
    'page loads and shows "Code Snippets" heading',
    async ({ page }) => {
      await page.goto(`${BASE}/snippets`)
      await expect(
        page.getByRole('heading', {
          name: 'Code Snippets',
        }),
      ).toBeVisible()
    },
  )

  test(
    'snippets page container is rendered',
    async ({ page }) => {
      await page.goto(`${BASE}/snippets`)
      await expect(
        page.getByTestId('snippets-page'),
      ).toBeVisible()
    },
  )

  test(
    '"New Snippet" button is visible',
    async ({ page }) => {
      await page.goto(`${BASE}/snippets`)
      await expect(
        page.getByTestId('new-snippet-btn'),
      ).toBeVisible()
    },
  )

  test(
    '"New Snippet" button links to new snippet page',
    async ({ page }) => {
      await page.goto(`${BASE}/snippets`)
      await expect(
        page.getByTestId('new-snippet-btn'),
      ).toHaveAttribute(
        'href',
        `${BASE}/snippets/new`,
      )
    },
  )

  test(
    '"New Snippet" button has accessible aria-label',
    async ({ page }) => {
      await page.goto(`${BASE}/snippets`)
      await expect(
        page.getByLabel('Create new snippet'),
      ).toBeVisible()
    },
  )

  test(
    'snippet search input is present',
    async ({ page }) => {
      await page.goto(`${BASE}/snippets`)
      await expect(
        page.getByTestId('snippet-search'),
      ).toBeVisible()
    },
  )
})

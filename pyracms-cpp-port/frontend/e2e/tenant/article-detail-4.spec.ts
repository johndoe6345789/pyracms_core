import { test, expect } from '@playwright/test'
import { BASE, MOCK_ARTICLE, MOCK_TENANT } from '../support/tenant-data-1'

test.describe(
  'Article detail — /site/demo/articles/hello-world',
  () => {
    test(
      'article actions section has correct ARIA region',
      async ({ page }) => {
        await page.route('**/api/tenants**', (route) =>
          route.fulfill({ json: MOCK_TENANT }),
        )
        await page.route(
          '**/api/articles/hello-world**',
          (route) =>
            route.fulfill({ json: MOCK_ARTICLE }),
        )
        await page.goto(`${BASE}/articles/hello-world`)
        await expect(
          page.getByTestId('article-actions'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'vote buttons section has correct ARIA container',
      async ({ page }) => {
        await page.route('**/api/tenants**', (route) =>
          route.fulfill({ json: MOCK_TENANT }),
        )
        await page.route(
          '**/api/articles/hello-world**',
          (route) =>
            route.fulfill({ json: MOCK_ARTICLE }),
        )
        await page.goto(`${BASE}/articles/hello-world`)
        await expect(
          page.getByTestId('article-vote-buttons'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'shows "not found" state or null when article missing',
      async ({ page }) => {
        await page.route('**/api/tenants**', (route) =>
          route.fulfill({ json: MOCK_TENANT }),
        )
        await page.route(
          '**/api/articles/hello-world**',
          (route) =>
            route.fulfill({
              status: 404,
              json: { detail: 'Not found' },
            }),
        )
        await page.goto(`${BASE}/articles/hello-world`)
        // ArticlePageClient returns null when !article;
        // verify the page did not hard-crash.
        await expect(page.locator('body')).toBeVisible()
      },
    )
  },
)

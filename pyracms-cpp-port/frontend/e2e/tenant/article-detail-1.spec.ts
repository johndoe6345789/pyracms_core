import { test, expect } from '@playwright/test'
import { BASE, MOCK_ARTICLE, MOCK_TENANT } from '../support/tenant-data-1'
import { collectConsoleErrors } from '../support/tenant-helpers-1'

test.describe(
  'Article detail — /site/demo/articles/hello-world',
  () => {
    test(
      'page loads without a fatal JS error',
      async ({ page }) => {
        const { errors, cleanup } =
          collectConsoleErrors(page)
        await page.goto(`${BASE}/articles/hello-world`)
        cleanup()
        const fatal = errors.filter(
          (e) =>
            e.includes('Uncaught') ||
            e.includes('TypeError'),
        )
        expect(fatal).toHaveLength(0)
      },
    )

    test(
      'shows article content when API returns data',
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
          page.getByTestId('article-detail-page'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'article title heading is visible',
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
          page.getByRole('heading', {
            name: 'Hello World',
          }),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'article content wrapper has aria-label',
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
          page.getByTestId('article-content-wrapper'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )
  },
)

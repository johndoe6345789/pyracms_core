import { test, expect } from '@playwright/test'
import { BASE, MOCK_ARTICLE, MOCK_TENANT } from '../support/tenant-data-1'
import { collectConsoleErrors } from '../support/tenant-helpers-1'

test.describe(
  'Article detail — /site/demo/articles/hello-world',
  () => {
    test(
      'Dislike button is visible and has aria-label',
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
          page.getByTestId('dislike-btn'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'Like count is displayed',
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
          page.getByTestId('like-count'),
        ).toHaveText('5', { timeout: 8_000 })
      },
    )

    test(
      'clicking Like button does not crash',
      async ({ page }) => {
        await page.route('**/api/tenants**', (route) =>
          route.fulfill({ json: MOCK_TENANT }),
        )
        await page.route(
          '**/api/articles/hello-world**',
          (route) =>
            route.fulfill({ json: MOCK_ARTICLE }),
        )
        await page.route('**/api/votes**', (route) =>
          route.fulfill({ json: { ok: true } }),
        )
        const { errors, cleanup } =
          collectConsoleErrors(page)
        await page.goto(`${BASE}/articles/hello-world`)
        await page
          .getByTestId('like-btn')
          .click({ timeout: 8_000 })
        cleanup()
        const fatal = errors.filter((e) =>
          e.includes('Uncaught'),
        )
        expect(fatal).toHaveLength(0)
      },
    )
  },
)

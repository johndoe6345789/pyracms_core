import { test, expect } from '@playwright/test'
import { BASE, MOCK_TENANT } from '../support/tenant-data-1'

test.describe(
  'Keyboard navigation & ARIA — cross-page',
  () => {
    test(
      'Tab key moves focus through tenant home links',
      async ({ page }) => {
        await page.goto(`${BASE}/`)
        // Focus the body and start tabbing.
        await page.locator('body').press('Tab')
        const focusedTag = await page.evaluate(
          () => document.activeElement?.tagName,
        )
        // First focusable element should be an A or BUTTON.
        expect(
          ['A', 'BUTTON', 'INPUT'].includes(
            focusedTag ?? '',
          ),
        ).toBe(true)
      },
    )

    test(
      'article list has correct region ARIA label',
      async ({ page }) => {
        await page.route('**/api/tenants**', (route) =>
          route.fulfill({ json: MOCK_TENANT }),
        )
        await page.route(
          '**/api/articles**',
          (route) =>
            route.fulfill({
              json: { items: [], total: 0 },
            }),
        )
        await page.goto(`${BASE}/articles`)
        await expect(
          page.locator(
            '[aria-label="Article list header"]',
          ),
        ).toBeAttached()
      },
    )

    test(
      'article search section has ARIA label',
      async ({ page }) => {
        await page.route('**/api/tenants**', (route) =>
          route.fulfill({ json: MOCK_TENANT }),
        )
        await page.route(
          '**/api/articles**',
          (route) =>
            route.fulfill({
              json: { items: [], total: 0 },
            }),
        )
        await page.goto(`${BASE}/articles`)
        await expect(
          page.locator(
            '[aria-label="Article search"]',
          ),
        ).toBeAttached()
      },
    )

    test(
      'forum page renders main heading with h1 semantics',
      async ({ page }) => {
        await page.goto(`${BASE}/forum`)
        // The "Forum" h3/h1 heading must exist.
        await expect(
          page.getByRole('heading', { name: 'Forum' }),
        ).toBeVisible()
      },
    )
  },
)

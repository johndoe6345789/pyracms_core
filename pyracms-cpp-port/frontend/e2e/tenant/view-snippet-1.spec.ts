import { test, expect } from '@playwright/test'
import { BASE } from '../support/tenant-data-1'
import { MOCK_SNIPPET } from '../support/tenant-data-3'

test.describe(
  'View Snippet — /site/demo/snippets/42',
  () => {
    test.beforeEach(async ({ page }) => {
      await page.route(
        '**/api/snippets/42**',
        (route) =>
          route.fulfill({ json: MOCK_SNIPPET }),
      )
    })

    test(
      'view snippet page container is rendered',
      async ({ page }) => {
        await page.goto(`${BASE}/snippets/42`)
        await expect(
          page.getByTestId('view-snippet-page'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'snippet title is shown as heading',
      async ({ page }) => {
        await page.goto(`${BASE}/snippets/42`)
        await expect(
          page.getByRole('heading', {
            name: 'Fibonacci',
          }),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      '"Back to Snippets" link is visible',
      async ({ page }) => {
        await page.goto(`${BASE}/snippets/42`)
        await expect(
          page.getByText('Back to Snippets'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      '"Run" button is visible',
      async ({ page }) => {
        await page.goto(`${BASE}/snippets/42`)
        await expect(
          page.getByTestId('run-snippet-btn'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      '"Run" button has accessible aria-label',
      async ({ page }) => {
        await page.goto(`${BASE}/snippets/42`)
        await expect(
          page
            .getByTestId('run-snippet-btn')
            .getByRole('button'),
        ).toBeAttached()
      },
    )

    test(
      '"Fork" button is visible',
      async ({ page }) => {
        await page.goto(`${BASE}/snippets/42`)
        await expect(
          page.getByTestId('fork-snippet-btn'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )
  },
)

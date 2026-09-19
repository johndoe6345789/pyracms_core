import { test, expect } from '@playwright/test'
import { BASE, MOCK_TENANT } from '../support/tenant-data-1'

test.describe(
  'New Snippet — /site/demo/snippets/new',
  () => {
    test.beforeEach(async ({ page }) => {
      await page.route('**/api/tenants**', (route) =>
        route.fulfill({ json: MOCK_TENANT }),
      )
    })

    test(
      '"Run" button has accessible aria-label',
      async ({ page }) => {
        await page.goto(`${BASE}/snippets/new`)
        await expect(
          page.getByLabel('Run snippet'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      '"Run" button is disabled when code is empty',
      async ({ page }) => {
        await page.goto(`${BASE}/snippets/new`)
        await expect(
          page.getByTestId('run-btn'),
        ).toBeDisabled()
      },
    )

    test(
      '"Save Snippet" button is present',
      async ({ page }) => {
        await page.goto(`${BASE}/snippets/new`)
        await expect(
          page.getByTestId('save-btn'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      '"Save Snippet" button has accessible aria-label',
      async ({ page }) => {
        await page.goto(`${BASE}/snippets/new`)
        await expect(
          page.getByLabel('Save snippet'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      '"Save Snippet" button is disabled when title or code empty',
      async ({ page }) => {
        await page.goto(`${BASE}/snippets/new`)
        await expect(
          page.getByTestId('save-btn'),
        ).toBeDisabled()
      },
    )

    test(
      '"Cancel" button links back to snippets list',
      async ({ page }) => {
        await page.goto(`${BASE}/snippets/new`)
        await expect(
          page.getByTestId('cancel-btn'),
        ).toHaveAttribute('href', `${BASE}/snippets`)
      },
    )
  },
)

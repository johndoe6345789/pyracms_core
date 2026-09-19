import { test, expect } from '@playwright/test'
import { BASE, MOCK_TENANT } from '../support/tenant-data-1'
import { MOCK_REVISIONS } from '../support/tenant-data-3'

const PAGE = '/site/demo/articles/hello-world/revisions'

test.describe(`Article revisions — ${PAGE}`, () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/tenants**', (route) =>
      route.fulfill({ json: MOCK_TENANT }),
    )
    await page.route('**/api/articles/hello-world/revisions**', (route) =>
      route.fulfill({ json: MOCK_REVISIONS }),
    )
  })

  test('revision table is rendered', async ({ page }) => {
    await page.goto(`${BASE}/articles/hello-world/revisions`)
    await expect(page.getByTestId('revision-table')).toBeVisible({
      timeout: 8_000,
    })
  })

  test('subtitle about managing revisions is visible', async ({ page }) => {
    await page.goto(`${BASE}/articles/hello-world/revisions`)
    await expect(page.getByText(/View and manage past revisions/i)).toBeVisible(
      { timeout: 8_000 },
    )
  })
})

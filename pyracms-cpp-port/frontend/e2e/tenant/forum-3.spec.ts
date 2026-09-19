import { test, expect } from '@playwright/test'
import { BASE, MOCK_CATEGORY, MOCK_TENANT } from '../support/tenant-data-1'

test.describe('Forum — /site/demo/forum', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/tenants**', (route) =>
      route.fulfill({ json: MOCK_TENANT }),
    )
    await page.route('**/api/forum/categories**', (route) =>
      route.fulfill({ json: [] }),
    )
  })

  test('category accordion toggle button is present', async ({ page }) => {
    await page.route('**/api/forum/categories**', (route) =>
      route.fulfill({ json: [MOCK_CATEGORY] }),
    )
    await page.goto(`${BASE}/forum`)
    await expect(page.getByLabel('Toggle General category')).toBeVisible({
      timeout: 8_000,
    })
  })
})

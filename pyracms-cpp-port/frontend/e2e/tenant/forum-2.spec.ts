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

  test('forum card inside category is clickable', async ({ page }) => {
    await page.route('**/api/forum/categories**', (route) =>
      route.fulfill({ json: [MOCK_CATEGORY] }),
    )
    await page.goto(`${BASE}/forum`)
    await expect(page.getByTestId('forum-card-1')).toBeVisible({
      timeout: 8_000,
    })
  })

  test('forum card link has correct href', async ({ page }) => {
    await page.route('**/api/forum/categories**', (route) =>
      route.fulfill({ json: [MOCK_CATEGORY] }),
    )
    await page.goto(`${BASE}/forum`)
    await expect(page.getByTestId('forum-link-1')).toHaveAttribute(
      'href',
      `${BASE}/forum/1`,
      { timeout: 8_000 },
    )
  })

  test('forum card link has accessible aria-label', async ({ page }) => {
    await page.route('**/api/forum/categories**', (route) =>
      route.fulfill({ json: [MOCK_CATEGORY] }),
    )
    await page.goto(`${BASE}/forum`)
    await expect(page.getByLabel('Open forum: General Discussion')).toBeVisible(
      { timeout: 8_000 },
    )
  })
})

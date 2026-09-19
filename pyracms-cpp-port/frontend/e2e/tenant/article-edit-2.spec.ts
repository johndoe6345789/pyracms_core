import { test, expect } from '@playwright/test'
import { BASE, MOCK_ARTICLE, MOCK_TENANT } from '../support/tenant-data-1'
import { loginAsAdmin } from '../support/tenant-helpers-1'

test.describe('Article edit — /site/demo/articles/hello-world/edit', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await page.route('**/api/tenants**', (route) =>
      route.fulfill({ json: MOCK_TENANT }),
    )
    await page.route('**/api/articles/hello-world**', (route) =>
      route.fulfill({ json: MOCK_ARTICLE }),
    )
  })

  test('title input field is present', async ({ page }) => {
    await page.goto(`${BASE}/articles/hello-world/edit`)
    await expect(page.getByTestId('article-title-input')).toBeVisible({
      timeout: 8_000,
    })
  })

  test('renderer selector is present', async ({ page }) => {
    await page.goto(`${BASE}/articles/hello-world/edit`)
    await expect(page.getByTestId('renderer-select')).toBeVisible({
      timeout: 8_000,
    })
  })

  test('tags input field is present', async ({ page }) => {
    await page.goto(`${BASE}/articles/hello-world/edit`)
    await expect(page.getByTestId('tags-input')).toBeVisible({ timeout: 8_000 })
  })

  test('summary input field is present', async ({ page }) => {
    await page.goto(`${BASE}/articles/hello-world/edit`)
    await expect(page.getByTestId('summary-input')).toBeVisible({
      timeout: 8_000,
    })
  })

  test('"Save Changes" button is visible', async ({ page }) => {
    await page.goto(`${BASE}/articles/hello-world/edit`)
    await expect(page.getByTestId('save-article-btn')).toBeVisible({
      timeout: 8_000,
    })
  })
})

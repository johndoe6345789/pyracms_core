import { test, expect } from '@playwright/test'
import { BASE, MOCK_CATEGORY, MOCK_TENANT } from '../support/tenant-data-1'
import { collectConsoleErrors } from '../support/tenant-helpers-1'

test.describe('Forum — /site/demo/forum', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/tenants**', (route) =>
      route.fulfill({ json: MOCK_TENANT }),
    )
    await page.route('**/api/forum/categories**', (route) =>
      route.fulfill({ json: [] }),
    )
  })

  test('page loads and shows "Forum" heading', async ({ page }) => {
    await page.goto(`${BASE}/forum`)
    await expect(page.getByRole('heading', { name: 'Forum' })).toBeVisible()
  })

  test('forum page container is rendered', async ({ page }) => {
    await page.goto(`${BASE}/forum`)
    await expect(page.getByTestId('forum-page')).toBeVisible()
  })

  test('subtitle text about discussions is visible', async ({ page }) => {
    await page.goto(`${BASE}/forum`)
    await expect(page.getByText(/Join discussions/i)).toBeVisible()
  })

  test('renders without a fatal JS error', async ({ page }) => {
    const { errors, cleanup } = collectConsoleErrors(page)
    await page.goto(`${BASE}/forum`)
    cleanup()
    const fatal = errors.filter((e) => e.includes('Uncaught'))
    expect(fatal).toHaveLength(0)
  })

  test('category accordion is rendered with data', async ({ page }) => {
    await page.route('**/api/forum/categories**', (route) =>
      route.fulfill({ json: [MOCK_CATEGORY] }),
    )
    await page.goto(`${BASE}/forum`)
    await expect(page.getByTestId('category-accordion-1')).toBeVisible({
      timeout: 8_000,
    })
  })
})

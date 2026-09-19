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

  test('revisions page container is rendered', async ({ page }) => {
    await page.goto(`${BASE}/articles/hello-world/revisions`)
    await expect(page.getByTestId('revisions-page')).toBeVisible({
      timeout: 8_000,
    })
  })

  test('"Revision History" heading is visible', async ({ page }) => {
    await page.goto(`${BASE}/articles/hello-world/revisions`)
    await expect(
      page.getByRole('heading', {
        name: 'Revision History',
      }),
    ).toBeVisible({ timeout: 8_000 })
  })

  test('"Back to Article" link is visible', async ({ page }) => {
    await page.goto(`${BASE}/articles/hello-world/revisions`)
    await expect(page.getByText('Back to Article')).toBeVisible({
      timeout: 8_000,
    })
  })

  test('revision section has ARIA label', async ({ page }) => {
    await page.goto(`${BASE}/articles/hello-world/revisions`)
    await expect(page.getByTestId('revisions-section')).toBeVisible({
      timeout: 8_000,
    })
  })
})

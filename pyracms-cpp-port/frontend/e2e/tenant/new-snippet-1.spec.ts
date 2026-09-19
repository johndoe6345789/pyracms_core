import { test, expect } from '@playwright/test'
import { BASE, MOCK_TENANT } from '../support/tenant-data-1'

test.describe('New Snippet — /site/demo/snippets/new', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/tenants**', (route) =>
      route.fulfill({ json: MOCK_TENANT }),
    )
  })

  test('new snippet page container is rendered', async ({ page }) => {
    await page.goto(`${BASE}/snippets/new`)
    await expect(page.getByTestId('new-snippet-page')).toBeVisible({
      timeout: 8_000,
    })
  })

  test('"New Code Snippet" heading is visible', async ({ page }) => {
    await page.goto(`${BASE}/snippets/new`)
    await expect(
      page.getByRole('heading', {
        name: 'New Code Snippet',
      }),
    ).toBeVisible({ timeout: 8_000 })
  })

  test('"Back to Snippets" link is visible', async ({ page }) => {
    await page.goto(`${BASE}/snippets/new`)
    await expect(page.getByText('Back to Snippets')).toBeVisible({
      timeout: 8_000,
    })
  })

  test('title input field is present', async ({ page }) => {
    await page.goto(`${BASE}/snippets/new`)
    await expect(page.getByTestId('snippet-title-input')).toBeVisible({
      timeout: 8_000,
    })
  })

  test('title input accepts text', async ({ page }) => {
    await page.goto(`${BASE}/snippets/new`)
    const titleInput = page.getByTestId('snippet-title-input')
    await titleInput.fill('My Snippet')
    await expect(titleInput).toHaveValue('My Snippet')
  })

  test('"Run" button is present', async ({ page }) => {
    await page.goto(`${BASE}/snippets/new`)
    await expect(page.getByTestId('run-btn')).toBeVisible({ timeout: 8_000 })
  })
})

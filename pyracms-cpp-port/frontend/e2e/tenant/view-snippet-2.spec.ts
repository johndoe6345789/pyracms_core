import { test, expect } from '@playwright/test'
import { BASE } from '../support/tenant-data-1'
import { MOCK_SNIPPET } from '../support/tenant-data-3'

test.describe('View Snippet — /site/demo/snippets/42', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/snippets/42**', (route) =>
      route.fulfill({ json: MOCK_SNIPPET }),
    )
  })

  test('"Fork" button has accessible aria-label', async ({ page }) => {
    await page.goto(`${BASE}/snippets/42`)
    await expect(page.getByLabel('Fork snippet')).toBeVisible({
      timeout: 8_000,
    })
  })

  test('"Share" button is visible', async ({ page }) => {
    await page.goto(`${BASE}/snippets/42`)
    await expect(page.getByTestId('share-snippet-btn')).toBeVisible({
      timeout: 8_000,
    })
  })

  test('"Share" button has accessible aria-label', async ({ page }) => {
    await page.goto(`${BASE}/snippets/42`)
    await expect(page.getByLabel('Share snippet')).toBeVisible({
      timeout: 8_000,
    })
  })

  test('code block is rendered', async ({ page }) => {
    await page.goto(`${BASE}/snippets/42`)
    await expect(page.getByTestId('snippet-code-block')).toBeVisible({
      timeout: 8_000,
    })
  })

  test('comment section is rendered', async ({ page }) => {
    await page.goto(`${BASE}/snippets/42`)
    await expect(page.getByTestId('comment-section')).toBeVisible({
      timeout: 8_000,
    })
  })

  test('comment input textarea is present', async ({ page }) => {
    await page.goto(`${BASE}/snippets/42`)
    await expect(page.getByTestId('comment-input')).toBeVisible({
      timeout: 8_000,
    })
  })
})

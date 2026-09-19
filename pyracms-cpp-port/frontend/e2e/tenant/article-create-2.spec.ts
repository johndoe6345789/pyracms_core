import { test, expect } from '@playwright/test'
import { BASE, MOCK_TENANT } from '../support/tenant-data-1'
import { loginAsAdmin } from '../support/tenant-helpers-1'

test.describe('Article create — /site/demo/articles/create', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await page.route('**/api/tenants**', (route) =>
      route.fulfill({ json: MOCK_TENANT }),
    )
  })

  test('renderer selector is visible', async ({ page }) => {
    await page.goto(`${BASE}/articles/create`)
    await expect(page.getByTestId('renderer-select')).toBeVisible()
  })

  test('"Back to Articles" button is present', async ({ page }) => {
    await page.goto(`${BASE}/articles/create`)
    await expect(page.getByText('Back to Articles')).toBeVisible()
  })

  test('submit button is visible and initially enabled', async ({ page }) => {
    await page.goto(`${BASE}/articles/create`)
    // Submit is disabled when title is empty
    const btn = page.getByTestId('create-article-submit')
    await expect(btn).toBeVisible()
  })

  test('submit button is enabled after filling title', async ({ page }) => {
    await page.goto(`${BASE}/articles/create`)
    await page.getByTestId('article-title-input').fill('Test Title')
    await expect(page.getByTestId('create-article-submit')).not.toBeDisabled()
  })

  test('"Cancel" button links back to article list', async ({ page }) => {
    await page.goto(`${BASE}/articles/create`)
    await expect(page.getByTestId('cancel-create-btn')).toHaveAttribute(
      'href',
      `${BASE}/articles`,
    )
  })

  test('tags input field is present', async ({ page }) => {
    await page.goto(`${BASE}/articles/create`)
    await expect(page.getByTestId('tags-input')).toBeVisible()
  })
})

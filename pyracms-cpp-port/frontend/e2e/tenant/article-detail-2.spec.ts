import { test, expect } from '@playwright/test'
import { BASE, MOCK_ARTICLE, MOCK_TENANT } from '../support/tenant-data-1'

test.describe('Article detail — /site/demo/articles/hello-world', () => {
  test('Edit button is present and links to edit page', async ({ page }) => {
    await page.route('**/api/tenants**', (route) =>
      route.fulfill({ json: MOCK_TENANT }),
    )
    await page.route('**/api/articles/hello-world**', (route) =>
      route.fulfill({ json: MOCK_ARTICLE }),
    )
    await page.goto(`${BASE}/articles/hello-world`)
    const editBtn = page.getByTestId('edit-article-btn')
    await expect(editBtn).toBeVisible({
      timeout: 8_000,
    })
    await expect(editBtn).toHaveAttribute(
      'href',
      `${BASE}/articles/hello-world/edit`,
    )
  })

  test('Revisions button is present and links to revisions', async ({
    page,
  }) => {
    await page.route('**/api/tenants**', (route) =>
      route.fulfill({ json: MOCK_TENANT }),
    )
    await page.route('**/api/articles/hello-world**', (route) =>
      route.fulfill({ json: MOCK_ARTICLE }),
    )
    await page.goto(`${BASE}/articles/hello-world`)
    const revBtn = page.getByTestId('revisions-btn')
    await expect(revBtn).toBeVisible({
      timeout: 8_000,
    })
    await expect(revBtn).toHaveAttribute(
      'href',
      `${BASE}/articles/hello-world/revisions`,
    )
  })

  test('Like button is visible and has aria-label', async ({ page }) => {
    await page.route('**/api/tenants**', (route) =>
      route.fulfill({ json: MOCK_TENANT }),
    )
    await page.route('**/api/articles/hello-world**', (route) =>
      route.fulfill({ json: MOCK_ARTICLE }),
    )
    await page.goto(`${BASE}/articles/hello-world`)
    const likeBtn = page.getByTestId('like-btn')
    await expect(likeBtn).toBeVisible({
      timeout: 8_000,
    })
    await expect(likeBtn).toHaveAttribute('aria-label', 'Like article')
  })
})

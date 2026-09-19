import { test, expect } from '@playwright/test'
import { BASE, MOCK_ARTICLE, MOCK_TENANT } from '../support/tenant-data-1'
import { loginAsAdmin } from '../support/tenant-helpers-1'

test.describe(
  'Article edit — /site/demo/articles/hello-world/edit',
  () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page)
      await page.route('**/api/tenants**', (route) =>
        route.fulfill({ json: MOCK_TENANT }),
      )
      await page.route(
        '**/api/articles/hello-world**',
        (route) =>
          route.fulfill({ json: MOCK_ARTICLE }),
      )
    })

    test(
      'page container is rendered',
      async ({ page }) => {
        await page.goto(
          `${BASE}/articles/hello-world/edit`,
        )
        await expect(
          page.getByTestId('edit-article-page'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      '"Edit Article" heading is visible',
      async ({ page }) => {
        await page.goto(
          `${BASE}/articles/hello-world/edit`,
        )
        await expect(
          page.getByRole('heading', {
            name: 'Edit Article',
          }),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      '"Back to Article" button links back',
      async ({ page }) => {
        await page.goto(
          `${BASE}/articles/hello-world/edit`,
        )
        await expect(
          page.getByText('Back to Article'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'article editor form is rendered',
      async ({ page }) => {
        await page.goto(
          `${BASE}/articles/hello-world/edit`,
        )
        await expect(
          page.getByTestId('article-editor-form'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )
  },
)

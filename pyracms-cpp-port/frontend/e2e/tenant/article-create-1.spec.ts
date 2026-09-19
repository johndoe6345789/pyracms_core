import { test, expect } from '@playwright/test'
import { BASE, MOCK_TENANT } from '../support/tenant-data-1'
import { loginAsAdmin } from '../support/tenant-helpers-1'

test.describe(
  'Article create — /site/demo/articles/create',
  () => {
    test.beforeEach(async ({ page }) => {
      await loginAsAdmin(page)
      await page.route('**/api/tenants**', (route) =>
        route.fulfill({ json: MOCK_TENANT }),
      )
    })

    test(
      'page container is rendered',
      async ({ page }) => {
        await page.goto(`${BASE}/articles/create`)
        await expect(
          page.getByTestId('create-article-page'),
        ).toBeVisible()
      },
    )

    test(
      '"Create Article" heading is visible',
      async ({ page }) => {
        await page.goto(`${BASE}/articles/create`)
        await expect(
          page.getByRole('heading', {
            name: 'Create Article',
          }),
        ).toBeVisible()
      },
    )

    test(
      'article editor form is rendered',
      async ({ page }) => {
        await page.goto(`${BASE}/articles/create`)
        await expect(
          page.getByTestId('article-editor-form'),
        ).toBeVisible()
      },
    )

    test(
      'title input field is visible',
      async ({ page }) => {
        await page.goto(`${BASE}/articles/create`)
        await expect(
          page.getByTestId('article-title-input'),
        ).toBeVisible()
      },
    )

    test(
      'title input can receive text input',
      async ({ page }) => {
        await page.goto(`${BASE}/articles/create`)
        const titleInput = page.getByTestId(
          'article-title-input',
        )
        await titleInput.fill('My New Article')
        await expect(titleInput).toHaveValue(
          'My New Article',
        )
      },
    )
  },
)

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
      '"Cancel" button links back to article',
      async ({ page }) => {
        await page.goto(
          `${BASE}/articles/hello-world/edit`,
        )
        const cancelBtn = page.getByTestId(
          'cancel-edit-btn',
        )
        await expect(cancelBtn).toBeVisible({
          timeout: 8_000,
        })
        await expect(cancelBtn).toHaveAttribute(
          'href',
          `${BASE}/articles/hello-world`,
        )
      },
    )

    test(
      'title input can receive edited text',
      async ({ page }) => {
        await page.goto(
          `${BASE}/articles/hello-world/edit`,
        )
        const titleInput = page.getByTestId(
          'article-title-input',
        )
        await expect(titleInput).toBeVisible({
          timeout: 8_000,
        })
        await titleInput.fill('Updated Title')
        await expect(titleInput).toHaveValue(
          'Updated Title',
        )
      },
    )

    test(
      'edit form section has ARIA label',
      async ({ page }) => {
        await page.goto(
          `${BASE}/articles/hello-world/edit`,
        )
        await expect(
          page.locator(
            '[aria-label="Edit article form"]',
          ),
        ).toBeAttached()
      },
    )
  },
)

import { test, expect } from '@playwright/test'
import { BASE } from '../support/tenant-data-1'
import { MOCK_SNIPPET } from '../support/tenant-data-3'

test.describe(
  'View Snippet — /site/demo/snippets/42',
  () => {
    test.beforeEach(async ({ page }) => {
      await page.route(
        '**/api/snippets/42**',
        (route) =>
          route.fulfill({ json: MOCK_SNIPPET }),
      )
    })

    test(
      '"Post Comment" button is present and disabled when empty',
      async ({ page }) => {
        await page.goto(`${BASE}/snippets/42`)
        const postBtn = page.getByTestId(
          'post-comment-btn',
        )
        await expect(postBtn).toBeVisible({
          timeout: 8_000,
        })
        await expect(postBtn).toBeDisabled()
      },
    )

    test(
      '"Post Comment" button enables after typing',
      async ({ page }) => {
        await page.goto(`${BASE}/snippets/42`)
        await page
          .getByTestId('comment-input')
          .fill('Great snippet!')
        await expect(
          page.getByTestId('post-comment-btn'),
        ).not.toBeDisabled()
      },
    )

    test(
      '"Post Comment" button has accessible aria-label',
      async ({ page }) => {
        await page.goto(`${BASE}/snippets/42`)
        await expect(
          page.getByLabel('Post comment'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )
  },
)

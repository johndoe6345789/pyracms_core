import { test, expect } from '@playwright/test'
import { BASE } from '../support/tenant-data-1'
import { MOCK_FORUM } from '../support/tenant-data-2'

test.describe(
  'Forum thread list — /site/demo/forum/1',
  () => {
    test.beforeEach(async ({ page }) => {
      await page.route(
        '**/api/forum/forums/1**',
        (route) =>
          route.fulfill({ json: MOCK_FORUM }),
      )
      await page.route(
        '**/api/forum/threads**',
        (route) => route.fulfill({ json: [] }),
      )
    })

    test(
      'page loads and thread list container is visible',
      async ({ page }) => {
        await page.goto(`${BASE}/forum/1`)
        await expect(
          page.getByTestId('thread-list-page'),
        ).toBeVisible()
      },
    )

    test(
      '"New Thread" button is visible',
      async ({ page }) => {
        await page.goto(`${BASE}/forum/1`)
        await expect(
          page.getByTestId('new-thread-button'),
        ).toBeVisible()
      },
    )

    test(
      '"New Thread" button links to create page',
      async ({ page }) => {
        await page.goto(`${BASE}/forum/1`)
        await expect(
          page.getByTestId('new-thread-button'),
        ).toHaveAttribute(
          'href',
          `${BASE}/forum/thread/create?forumId=1`,
        )
      },
    )

    test(
      '"Back to Forums" link navigates to forum index',
      async ({ page }) => {
        await page.goto(`${BASE}/forum/1`)
        await expect(
          page.getByText('Back to Forums'),
        ).toBeVisible()
      },
    )

    test(
      'thread table is rendered',
      async ({ page }) => {
        await page.goto(`${BASE}/forum/1`)
        await expect(
          page.getByTestId('thread-table'),
        ).toBeVisible()
      },
    )
  },
)

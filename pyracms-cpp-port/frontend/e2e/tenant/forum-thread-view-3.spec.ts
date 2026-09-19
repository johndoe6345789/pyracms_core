import { test, expect } from '@playwright/test'
import { BASE } from '../support/tenant-data-1'
import { MOCK_POSTS, MOCK_THREAD } from '../support/tenant-data-2'
import { collectConsoleErrors } from '../support/tenant-helpers-1'

test.describe(
  'Forum thread view — /site/demo/forum/thread/1',
  () => {
    test.beforeEach(async ({ page }) => {
      await page.route(
        '**/api/forum/threads/1**',
        (route) =>
          route.fulfill({ json: MOCK_THREAD }),
      )
      await page.route(
        '**/api/forum/posts**',
        (route) =>
          route.fulfill({ json: MOCK_POSTS }),
      )
    })

    test(
      'quick reply textarea has accessible aria-label',
      async ({ page }) => {
        await page.goto(
          `${BASE}/forum/thread/1`,
        )
        await expect(
          page.getByLabel('Reply content'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'renders without a fatal JS error',
      async ({ page }) => {
        const { errors, cleanup } =
          collectConsoleErrors(page)
        await page.goto(
          `${BASE}/forum/thread/1`,
        )
        cleanup()
        const fatal = errors.filter((e) =>
          e.includes('Uncaught'),
        )
        expect(fatal).toHaveLength(0)
      },
    )
  },
)

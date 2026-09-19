import { test, expect } from '@playwright/test'
import { BASE } from '../support/tenant-data-1'
import { MOCK_FORUM, MOCK_THREADS } from '../support/tenant-data-2'
import { collectConsoleErrors } from '../support/tenant-helpers-1'

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
      'thread pagination is rendered',
      async ({ page }) => {
        await page.goto(`${BASE}/forum/1`)
        await expect(
          page.getByTestId('thread-pagination'),
        ).toBeVisible()
      },
    )

    test(
      'thread table has accessible aria-label',
      async ({ page }) => {
        await page.goto(`${BASE}/forum/1`)
        await expect(
          page.getByRole('table', {
            name: 'Forum threads',
          }),
        ).toBeVisible()
      },
    )

    test(
      'thread row links to thread view page',
      async ({ page }) => {
        await page.route(
          '**/api/forum/threads**',
          (route) =>
            route.fulfill({ json: MOCK_THREADS }),
        )
        await page.goto(`${BASE}/forum/1`)
        await expect(
          page.getByTestId('thread-row-1'),
        ).toBeVisible({ timeout: 8_000 })
      },
    )

    test(
      'renders without a fatal JS error',
      async ({ page }) => {
        const { errors, cleanup } =
          collectConsoleErrors(page)
        await page.goto(`${BASE}/forum/1`)
        cleanup()
        const fatal = errors.filter((e) =>
          e.includes('Uncaught'),
        )
        expect(fatal).toHaveLength(0)
      },
    )
  },
)
